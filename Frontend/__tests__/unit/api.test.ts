import { fetchModels, sendChatMessage } from "@/lib/api";

global.fetch = jest.fn();

describe("sendChatMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the response and model metadata when the request succeeds", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: "Hello back!",
        model: "google/gemma-4-31b-it:free",
        requested_model: "google/gemma-4-31b-it:free",
        fallback: false,
      }),
    } as Response);

    const result = await sendChatMessage("Hi there");

    expect(result).toEqual({
      response: "Hello back!",
      model: "google/gemma-4-31b-it:free",
      requestedModel: "google/gemma-4-31b-it:free",
      fallback: false,
    });
  });

  it("reports when a fallback model answered instead of the requested one", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: "Answered by backup",
        model: "qwen/qwen3-8b:free",
        requested_model: "google/gemma-4-31b-it:free",
        fallback: true,
      }),
    } as Response);

    const result = await sendChatMessage("Hi there", "google/gemma-4-31b-it:free");

    expect(result.fallback).toBe(true);
    expect(result.model).toBe("qwen/qwen3-8b:free");
  });

  it("throws an error when the response is not ok", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "All free models are currently rate-limited." }),
    } as Response);

    await expect(sendChatMessage("Hi there")).rejects.toThrow(
      "All free models are currently rate-limited."
    );
  });
});

describe("fetchModels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the list of models and the default", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        models: [{ id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (Free)" }],
        default: "google/gemma-4-31b-it:free",
      }),
    } as Response);

    const result = await fetchModels();

    expect(result.default).toBe("google/gemma-4-31b-it:free");
    expect(result.models).toHaveLength(1);
  });

  it("throws an error when the response is not ok", async () => {
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(fetchModels()).rejects.toThrow("Failed to load models");
  });
});