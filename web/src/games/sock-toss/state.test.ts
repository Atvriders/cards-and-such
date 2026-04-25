import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { tosses: "6" as const };

describe("SockToss", () => {
  it("starts at height 0 in tossing phase", () => { const s = initialState(1, S); expect(s.height).toBe(0); expect(s.phase).toBe("tossing"); });
  it("tick raises height", () => { expect(reducer(initialState(1, S), { type: "tick" }).height).toBeGreaterThan(0); });
  it("release in basket zone scores 100", () => {
    const s = { ...initialState(1, S), height: 50, basket: 50 };
    const s2 = reducer(s, { type: "release" });
    expect(s2.lastPoints).toBe(100);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
