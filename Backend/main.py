from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os
from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
load_dotenv()

# Get API key
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
    allow_origins=["*"], # can put my frontend url here ("http://localhost:3000")
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            # meta-llama/llama-3.3-8b-instruct:free
            # google/gemma-4-26b-a4b-it:free
            # google/gemma-4-31b-it:free
            model="google/gemma-4-31b-it:free",
            messages=[
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        print(f"Error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )