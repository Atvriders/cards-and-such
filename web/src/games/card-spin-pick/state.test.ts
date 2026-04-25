import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "8" as const };

describe("CardSpinPick", () => {
  it("starts with 4 cards and picking phase", () => {
    const s = initialState(1, S);
    expect(s.rowCards.length).toBe(4);
    expect(s.phase).toBe("picking");
  });
  it("pick sets playerPick", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "pick", index: 2 });
    expect(s2.playerPick).toBe(2);
  });
  it("spin reveals result and adds score", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "pick", index: 0 });
    const s3 = reducer(s2, { type: "spin" });
    expect(s3.score).toBeGreaterThan(0);
    expect(s3.spinResult).not.toBeNull();
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
