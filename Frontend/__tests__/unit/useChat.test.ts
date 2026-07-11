import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";

jest.mock("@/lib/api", () => ({
  sendChatMessage: jest.fn(),
  fetchModels: jest.fn(),
}));

import { sendChatMessage, fetchModels } from "@/lib/api";

const MODELS = [
  { id: "openai/gpt-oss-120b:free", label: "GPT-OSS 120B (Free)" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (Free)" },
];

describe("useChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(fetchModels).mockResolvedValue({
      models: MODELS,
      default: MODELS[0].id,
    });
  });

  it("starts with no messages and not loading", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("loads the model list and selects the default model", async () => {
    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.models).toEqual(MODELS);
    });

    expect(result.current.selectedModel).toBe(MODELS[0].id);
  });

  it("adds a user message immediately, then the assistant reply", async () => {
    jest.mocked(sendChatMessage).mockResolvedValueOnce({
      response: "Hi, how can I help?",
      model: MODELS[0].id,
      requestedModel: MODELS[0].id,
      fallback: false,
    });

    const { result } = renderHook(() => useChat());
    await waitFor(() => expect(result.current.selectedModel).toBe(MODELS[0].id));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.messages).toEqual([
      { role: "user", text: "Hello" },
      { role: "assistant", text: "Hi, how can I help?", fallbackNotice: undefined },
    ]);
  });

  it("attaches a fallback notice when a backup model answered", async () => {
    jest.mocked(sendChatMessage).mockResolvedValueOnce({
      response: "Answered by backup",
      model: MODELS[1].id,
      requestedModel: MODELS[0].id,
      fallback: true,
    });

    const { result } = renderHook(() => useChat());
    await waitFor(() => expect(result.current.selectedModel).toBe(MODELS[0].id));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.messages[1].fallbackNotice).toContain(MODELS[1].label);
  });

  it("surfaces an error message when the request fails", async () => {
    jest.mocked(sendChatMessage).mockRejectedValueOnce(new Error("All models rate-limited"));

    const { result } = renderHook(() => useChat());
    await waitFor(() => expect(result.current.selectedModel).toBe(MODELS[0].id));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.error).toBe("All models rate-limited");
  });

  it("ignores empty or whitespace-only input", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(sendChatMessage).not.toHaveBeenCalled();
  });
});