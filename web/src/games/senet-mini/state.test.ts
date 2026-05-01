import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, MUST_ROLL_6 } from "./state.js";

const S = { dummy: false };

describe("senet-mini", () => {
  it("starts with all pawns at start position", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe("P");
    expect(s.pPos.length).toBe(PAWNS_PER_SIDE);
    expect(s.cPos.length).toBe(PAWNS_PER_SIDE);
    const expected = MUST_ROLL_6 ? -1 : 0;
    expect(s.pPos.every(p => p === expected)).toBe(true);
  });

  it("roll transitions to moving phase or completes turn", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    expect(["moving", "rolling", "done"]).toContain(s.phase);
    if (s.phase === "moving") {
      expect(s.dice.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("track length is positive and pawns count valid", () => {
    expect(TRACK_LEN).toBeGreaterThan(5);
    expect(PAWNS_PER_SIDE).toBeGreaterThanOrEqual(1);
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("legalMovesForP after roll yields zero or more moves", () => {
    const s = reducer(initialState(7, S), { type: "roll" });
    if (s.phase === "moving") {
      const m = legalMovesForP(s);
      expect(Array.isArray(m)).toBe(true);
    }
  });

  it("end turn delegates to CPU and returns to player or done", () => {
    const s = reducer(initialState(13, S), { type: "endTurn" });
    expect(["rolling", "done"]).toContain(s.phase);
    if (s.phase === "rolling") expect(s.turn).toBe("P");
  });
});
