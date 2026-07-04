import { sendChatMessage } from "@/lib/api";

global.fetch = jest.fn();

describe("sendChatMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the response text when the request succeeds", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Hello back!" }),
    } as Response);

    const result = await sendChatMessage("Hi there");

    expect(result).toBe("Hello back!");
  });

  it("throws an error when the response is not ok", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(sendChatMessage("Hi there")).rejects.toThrow(
      "Failed to send message"
    );
  });
});