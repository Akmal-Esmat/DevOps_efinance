import { renderHook, act } from "@testing-library/react";
import { useChat } from "@/hooks/useChat";

jest.mock("@/lib/api", () => ({
  sendChatMessage: jest.fn(),
}));

import { sendChatMessage } from "@/lib/api";

describe("useChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with no messages and not loading", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("adds a user message immediately, then the assistant reply", async () => {
    jest.mocked(sendChatMessage).mockResolvedValueOnce("Hi, how can I help?");

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.messages).toEqual([
      { role: "user", text: "Hello" },
      { role: "assistant", text: "Hi, how can I help?" },
    ]);
  });

  it("ignores empty or whitespace-only input", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(sendChatMessage).not.toHaveBeenCalled();
  });
});