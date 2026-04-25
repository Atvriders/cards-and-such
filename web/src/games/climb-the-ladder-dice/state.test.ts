import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, RUNGS } from "./state.js";

const def = { rerolls: "1" as const };

describe("ClimbTheLadderDice initialState", () => {
  it("starts on rung 0 in rolling phase", () => {
    const s = initialState(1, def);
    expect(s.rung).toBe(0);
    expect(s.phase).toBe("rolling");
  });

  it("dice values are 1-6", () => {
    const s = initialState(1, def);
    expect(s.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s.dice[0]).toBeLessThanOrEqual(6);
    expect(s.dice[1]).toBeGreaterThanOrEqual(1);
    expect(s.dice[1]).toBeLessThanOrEqual(6);
  });

  it("rerollsLeft matches settings", () => {
    expect(initialState(1, def).rerollsLeft).toBe(1);
    expect(initialState(1, { rerolls: "2" }).rerollsLeft).toBe(2);
  });

  it("RUNGS has 6 entries", () => {
    expect(RUNGS.length).toBe(6);
  });
});

describe("ClimbTheLadderDice reducer", () => {
  it("accept advances rung", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "accept" });
    if (s2.phase !== "gameover") expect(s2.rung).toBe(1);
  });

  it("roll decrements rerollsLeft", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rerollsLeft).toBe(0);
  });

  it("toggleHold flips hold state", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "toggleHold", idx: 0 });
    expect(s2.held[0]).toBe(true);
  });

  it("accept on passing rung scores sum", () => {
    // find a rung where sum passes
    let s = initialState(1, def);
    const target = RUNGS[s.rung]!;
    const sum = s.dice[0] + s.dice[1];
    const s2 = reducer(s, { type: "accept" });
    if (sum >= target && s2.rungScores[0] !== null) {
      expect(s2.rungScores[0]).toBe(sum);
    }
  });
});

describe("ClimbTheLadderDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when all rungs done", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "accept" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
