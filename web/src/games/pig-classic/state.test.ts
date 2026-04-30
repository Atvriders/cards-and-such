import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET, MAX_TURNS } from "./state.js";
import type { PigClassicState } from "./state.js";

const S = { dummy: false };

describe("PigClassic initial state", () => {
  it("starts in playing, turn 1, no score", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.totalScore).toBe(0);
    expect(s.turn).toBe(1);
    expect(s.turnTotal).toBe(0);
    expect(s.lastRoll).toBe(0);
    expect(s.rollHistory).toEqual([]);
  });

  it("is deterministic for same seed", () => {
    expect(initialState(42, S)).toEqual(initialState(42, S));
  });
});

describe("PigClassic roll mechanics", () => {
  it("roll produces a die face 1-6", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.lastRoll).toBeGreaterThanOrEqual(1);
    expect(s.lastRoll).toBeLessThanOrEqual(6);
  });

  it("rolling a non-1 adds to turnTotal and appends to history", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (!s.lastWasOne && s.lastRoll !== 0) {
      expect(s.turnTotal).toBe(s.lastRoll);
      expect(s.rollHistory).toEqual([s.lastRoll]);
    }
  });

  it("rolling a 1 wipes turnTotal, ends turn, clears history", () => {
    // Find a seed that produces a 1 first
    for (let seed = 1; seed < 200; seed++) {
      const s = reducer(initialState(seed, S), { type: "roll" });
      if (s.lastWasOne) {
        expect(s.turnTotal).toBe(0);
        expect(s.lastRoll).toBe(1);
        expect(s.rollHistory).toEqual([]);
        expect(s.turn).toBe(2);
        return;
      }
    }
  });
});

describe("PigClassic bank action", () => {
  it("bank with 0 turnTotal is a no-op", () => {
    const s = initialState(1, S);
    const after = reducer(s, { type: "bank" });
    expect(after).toEqual(s);
  });

  it("bank moves turnTotal to totalScore and advances turn", () => {
    let s = initialState(1, S);
    // Roll until we get a non-1
    for (let i = 0; i < 5 && s.turnTotal === 0; i++) s = reducer(s, { type: "roll" });
    if (s.turnTotal > 0) {
      const tt = s.turnTotal;
      const after = reducer(s, { type: "bank" });
      expect(after.totalScore).toBe(tt);
      expect(after.turnTotal).toBe(0);
      expect(after.turn).toBe(s.turn + 1);
      expect(after.bestTurn).toBeGreaterThanOrEqual(tt);
    }
  });

  it("reaching TARGET ends the game", () => {
    const fake: PigClassicState = {
      ...initialState(1, S),
      turnTotal: TARGET + 5,
    };
    const after = reducer(fake, { type: "bank" });
    expect(after.phase).toBe("done");
    expect(after.totalScore).toBe(TARGET + 5);
  });
});

describe("PigClassic terminal", () => {
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const fake: PigClassicState = {
      ...initialState(1, S),
      phase: "done",
      totalScore: 105,
    };
    expect(isTerminal(fake)).toEqual({ score: 105 });
  });

  it("running out of turns ends game", () => {
    let s = initialState(1, S);
    let safety = 1000;
    while (s.phase !== "done" && safety-- > 0) {
      // Conservative play: bank as soon as turnTotal > 0
      const rolled = reducer(s, { type: "roll" });
      if (rolled.lastWasOne) {
        s = rolled;
      } else if (rolled.turnTotal > 0) {
        s = reducer(rolled, { type: "bank" });
      } else {
        s = rolled;
      }
    }
    expect(s.phase).toBe("done");
    expect(s.turn).toBeLessThanOrEqual(MAX_TURNS + 1);
  });
});
