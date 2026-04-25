import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts in aim phase with full fuel", () => {
    const s = initialState(42, def);
    expect(s.phase).toBe("aim");
    expect(s.fuel).toBe(s.maxFuel);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7, def);
    const s2 = initialState(7, def);
    expect(s1.targetX).toBe(s2.targetX);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — movement", () => {
  it("move-left decrements rocketX and fuel", () => {
    const s = initialState(42, def);
    const s2 = reducer({ ...s, rocketX: 4 }, { type: "move-left" });
    expect(s2.rocketX).toBe(3);
    expect(s2.fuel).toBe(s.fuel - 1);
  });

  it("move-right increments rocketX and fuel", () => {
    const s = initialState(42, def);
    const s2 = reducer({ ...s, rocketX: 4 }, { type: "move-right" });
    expect(s2.rocketX).toBe(5);
    expect(s2.fuel).toBe(s.fuel - 1);
  });

  it("cannot move past left wall", () => {
    const s = initialState(42, def);
    const s2 = reducer({ ...s, rocketX: 0 }, { type: "move-left" });
    expect(s2.rocketX).toBe(0);
  });

  it("cannot move past right wall", () => {
    const s = initialState(42, def);
    const s2 = reducer({ ...s, rocketX: 8 }, { type: "move-right" });
    expect(s2.rocketX).toBe(8);
  });
});

describe("reducer — launch", () => {
  it("hit scores >=100 and sets phase to result", () => {
    const s = initialState(42, def);
    const aligned = { ...s, rocketX: s.targetX };
    const s2 = reducer(aligned, { type: "launch" });
    expect(s2.phase).toBe("result");
    expect(s2.lastHit).toBe(true);
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });

  it("miss scores 0 and records miss", () => {
    const s = initialState(42, def);
    const misaligned = { ...s, rocketX: (s.targetX + 3) % 9 };
    const s2 = reducer(misaligned, { type: "launch" });
    expect(s2.phase).toBe("result");
    expect(s2.lastHit).toBe(false);
    expect(s2.score).toBe(0);
    expect(s2.misses).toBe(1);
  });
});

describe("reducer — next-round", () => {
  it("advances to next round with fresh fuel", () => {
    const s = initialState(42, def);
    const launched = reducer({ ...s, rocketX: s.targetX }, { type: "launch" });
    const s2 = reducer(launched, { type: "next-round" });
    expect(s2.phase).toBe("aim");
    expect(s2.fuel).toBe(s2.maxFuel);
    expect(s2.roundsLeft).toBe(s.roundsLeft - 1);
  });

  it("ends game when rounds run out", () => {
    const s = initialState(42, def);
    const launched = reducer({ ...s, rocketX: s.targetX, roundsLeft: 1 }, { type: "launch" });
    const final = reducer(launched, { type: "next-round" });
    expect(final.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 350 };
    expect(isTerminal(s)!.score).toBe(350);
  });
});
