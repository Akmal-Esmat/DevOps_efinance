from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError, APIStatusError
import os
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    CONTENT_TYPE_LATEST,
    generate_latest,
)
import time
from fastapi.responses import Response

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY not found in .env file, and not defined in environment")

client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics

chat_requests = Counter(
    "chat_requests_total",
    "Total number of chat requests",
)

active_chat_requests = Gauge(
    "active_chat_requests",
    "Current number of active chat requests",
)

chat_duration = Histogram(
    "chat_duration_seconds",
    "Time spent processing chat requests",
)

fallback_requests = Counter(
    "chat_fallback_total",
    "Number of requests that required a fallback model",
)

# Free models to try, in priority order. First = default.
FREE_MODELS = [
    {"id": "openai/gpt-oss-120b:free", "label": "GPT-OSS 120B (Free)"},
    {"id": "google/gemma-4-31b-it:free", "label": "Gemma 4 31B (Free)"},
    {"id": "nvidia/nemotron-3-super-120b-a12b:free", "label": "Nemotron 3 Super (Free)"},
    {"id": "openai/gpt-oss-20b:free", "label": "GPT-OSS 20B (Free)"},
]
FREE_MODEL_IDS = [m["id"] for m in FREE_MODELS]
DEFAULT_MODEL = FREE_MODEL_IDS[0]


class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = None


def _is_rate_limited(exc: Exception) -> bool:
    if isinstance(exc, RateLimitError):
        return True
    if isinstance(exc, APIStatusError) and exc.status_code == 429:
        return True
    return "429" in str(exc) or "rate limit" in str(exc).lower()

# Prometheus Endpoint

@app.get("/metrics")
def metrics():
    return Response(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )

@app.get("/models")
def list_models():
    return {"models": FREE_MODELS, "default": DEFAULT_MODEL}


@app.post("/chat")
def chat(request: ChatRequest):
    chat_requests.inc()
    active_chat_requests.inc()
    with chat_duration.time():
        requested_model = request.model or DEFAULT_MODEL
        models_to_try = [requested_model] + [m for m in FREE_MODEL_IDS if m != requested_model]
        last_error: Optional[Exception] = None
        
        for model in models_to_try:
        
                try:
                    response = client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": request.message}]
                    )
                    if model != requested_model:
                        fallback_requests.inc()
                    return {
                        "response": response.choices[0].message.content,
                        "model": model,
                        "requested_model": requested_model,
                        "fallback": model != requested_model,
                    }
                except Exception as e:
                    print(f"Error with model {model}: {e}")
                    last_error = e
                    if _is_rate_limited(e):
                        continue
                    active_chat_requests.dec()
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
        active_chat_requests.dec()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "All free models are currently rate-limited. Please try again shortly.",
                "retryable": True,
                "available_models": FREE_MODEL_IDS,
                "last_error": str(last_error),
            }
        )