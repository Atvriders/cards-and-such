import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLobbyPresence } from "../src/platform/api/ws.js";

describe("useLobbyPresence", () => {
  it("returns disconnected state when token is null", () => {
    const { result } = renderHook(() => useLobbyPresence(null));
    expect(result.current.connected).toBe(false);
    expect(result.current.online).toBe(0);
    expect(result.current.users).toEqual([]);
  });
});
