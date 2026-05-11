import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { submitScore } from "./submitScore";
import { hashSettings } from "./hashSettings";
import { useAuth } from "../stores/auth";

describe("submitScore", () => {
  const originalState = useAuth.getState();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    useAuth.setState(originalState, true);
  });

  it("does not call fetch when there is no auth token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    useAuth.setState({ token: null });

    await submitScore("solitaire", 42, { difficulty: "easy" });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs the parsed payload with bearer auth when token present", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    useAuth.setState({ token: "tok-abc" });

    const settings = { difficulty: "hard", seed: 7 };
    await submitScore("solitaire", 123, settings);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/scores");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
    expect(headers.authorization).toBe("Bearer tok-abc");
    expect(JSON.parse(init.body as string)).toEqual({
      gameId: "solitaire",
      score: 123,
      settingsHash: hashSettings(settings),
    });
  });

  it("throws when zod rejects an invalid gameId", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    useAuth.setState({ token: "tok-abc" });

    await expect(submitScore("Bad GameId!", 1, {})).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
