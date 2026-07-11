const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ModelOption {
  id: string;
  label: string;
}

export interface ChatResult {
  response: string;
  model: string;
  requestedModel: string;
  fallback: boolean;
}

export async function fetchModels(): Promise<{ models: ModelOption[]; default: string }> {
  const res = await fetch(`${API_URL}/models`);
  if (!res.ok) throw new Error("Failed to load models");
  return res.json();
}

export async function sendChatMessage(message: string, model?: string): Promise<ChatResult> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model }),
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = data?.detail;
    const errorMessage = typeof detail === "string" ? detail : detail?.error || "Failed to send message";
    throw new Error(errorMessage);
  }

  return {
    response: data.response,
    model: data.model,
    requestedModel: data.requested_model,
    fallback: data.fallback,
  };
}