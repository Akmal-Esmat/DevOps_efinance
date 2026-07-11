import os
os.environ.setdefault("OPENROUTER_API_KEY", "test-key-for-pytest")

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def make_fake_response(content: str):
    """Builds a fake object shaped like OpenAI's real response,
    just deep enough to satisfy response.choices[0].message.content"""
    message = MagicMock()
    message.content = content
    choice = MagicMock()
    choice.message = message
    response = MagicMock()
    response.choices = [choice]
    return response


@patch("main.client.chat.completions.create")
def test_chat_returns_reply_on_success(mock_create):
    mock_create.return_value = make_fake_response("Hello, how can I help?")

    res = client.post("/chat", json={"message": "Hi"})

    assert res.status_code == 200
    body = res.json()
    assert body["response"] == "Hello, how can I help?"
    assert body["fallback"] is False
    mock_create.assert_called_once()


@patch("main.client.chat.completions.create")
def test_chat_returns_502_when_api_fails_with_non_rate_limit_error(mock_create):
    mock_create.side_effect = Exception("API is down")

    res = client.post("/chat", json={"message": "Hi"})

    assert res.status_code == 502
    assert "API is down" in res.json()["detail"]


@patch("main.client.chat.completions.create")
def test_chat_falls_back_to_next_model_on_rate_limit(mock_create):
    from main import FREE_MODEL_IDS

    mock_create.side_effect = [
        Exception("429 rate limit exceeded"),
        make_fake_response("Answered by the backup model"),
    ]

    res = client.post("/chat", json={"message": "Hi"})

    assert res.status_code == 200
    body = res.json()
    assert body["response"] == "Answered by the backup model"
    assert body["fallback"] is True
    assert body["model"] == FREE_MODEL_IDS[1]
    assert mock_create.call_count == 2


@patch("main.client.chat.completions.create")
def test_chat_returns_429_when_all_models_rate_limited(mock_create):
    from main import FREE_MODEL_IDS

    mock_create.side_effect = Exception("429 rate limit exceeded")

    res = client.post("/chat", json={"message": "Hi"})

    assert res.status_code == 429
    assert mock_create.call_count == len(FREE_MODEL_IDS)


def test_chat_rejects_missing_message_field():
    res = client.post("/chat", json={})

    assert res.status_code == 422  # FastAPI/Pydantic validation, before your code even runs


def test_list_models_returns_free_models():
    res = client.get("/models")

    assert res.status_code == 200
    body = res.json()
    assert "models" in body
    assert "default" in body
    assert len(body["models"]) > 0