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
    assert res.json() == {"response": "Hello, how can I help?"}
    mock_create.assert_called_once()


@patch("main.client.chat.completions.create")
def test_chat_returns_500_when_api_fails(mock_create):
    mock_create.side_effect = Exception("API is down")

    res = client.post("/chat", json={"message": "Hi"})

    assert res.status_code == 500
    assert "API is down" in res.json()["detail"]


def test_chat_rejects_missing_message_field():
    res = client.post("/chat", json={})

    assert res.status_code == 422  # FastAPI/Pydantic validation, before your code even runs