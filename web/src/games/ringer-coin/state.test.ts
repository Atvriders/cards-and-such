import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { tosses: "5" as const };

describe("RingerCoin", () => {
  it("starts at angle 0 in aiming phase", () => { const s = initialState(1, S); expect(s.aimAngle).toBe(0); expect(s.phase).toBe("aiming"); });
  it("tick advances angle", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.aimAngle).toBeGreaterThan(0);
  });
  it("toss at ring zone scores 100", () => {
    const s = { ...initialState(1, S), aimAngle: 90 };
    const s2 = reducer(s, { type: "toss" });
    expect(s2.lastPoints).toBe(100);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
