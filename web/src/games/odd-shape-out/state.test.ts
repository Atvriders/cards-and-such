import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { OSOState } from "./state.js";

const med = { difficulty: "medium" as const };
const easy = { difficulty: "easy" as const };

describe("OddShapeOut initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, med);
    expect(s.phase).toBe("idle");
    expect(s.round).toBe(0);
    expect(s.shapes.length).toBe(0);
  });

  it("timeLimit differs by difficulty", () => {
    const se = initialState(42, easy);
    const sm = initialState(42, med);
    expect(se.timeLimit).toBeGreaterThan(sm.timeLimit);
  });
});

describe("OddShapeOut start", () => {
  it("enters playing with 8 shapes", () => {
    const s = initialState(42, med);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("playing");
    expect(s2.shapes.length).toBe(8);
    expect(s2.round).toBe(1);
  });

  it("oddIndex is in range 0-7", () => {
    const s2 = reducer(initialState(42, med), { type: "start" });
    expect(s2.oddIndex).toBeGreaterThanOrEqual(0);
    expect(s2.oddIndex).toBeLessThanOrEqual(7);
  });

  it("same seed same shapes and oddIndex", () => {
    const play = (seed: number) => {
      const s2 = reducer(initialState(seed, med), { type: "start" });
      return { shapes: [...s2.shapes], oddIndex: s2.oddIndex };
    };
    const a = play(10);
    const b = play(10);
    expect(a.shapes).toEqual(b.shapes);
    expect(a.oddIndex).toBe(b.oddIndex);
  });

  it("different seeds likely produce different shapes", () => {
    const a = reducer(initialState(1, med), { type: "start" }).shapes;
    const b = reducer(initialState(2, med), { type: "start" }).shapes;
    // Very likely different
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});

describe("OddShapeOut pick", () => {
  it("correct pick scores 10+ and moves to result", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    const s2 = reducer(s, { type: "pick", index: s.oddIndex });
    expect(s2.phase).toBe("result");
    expect(s2.lastResult).toBe("correct");
    expect(s2.score).toBeGreaterThanOrEqual(10);
    expect(s2.correct).toBe(1);
  });

  it("wrong pick scores 0", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    const wrongIdx = (s.oddIndex + 1) % 8;
    const s2 = reducer(s, { type: "pick", index: wrongIdx });
    expect(s2.phase).toBe("result");
    expect(s2.lastResult).toBe("wrong");
    expect(s2.score).toBe(0);
    expect(s2.correct).toBe(0);
  });

  it("pick is no-op outside playing phase", () => {
    const s = initialState(42, med);
    const s2 = reducer(s, { type: "pick", index: 0 });
    expect(s2.phase).toBe("idle");
  });
});

describe("OddShapeOut tick and timeout", () => {
  it("tick reduces timeLeft", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    const s2 = reducer(s, { type: "tick", elapsed: 500 });
    expect(s2.timeLeft).toBe(s.timeLeft - 500);
  });

  it("tick to zero transitions to result with timeout", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    const s2 = reducer(s, { type: "tick", elapsed: s.timeLeft + 100 });
    expect(s2.phase).toBe("result");
    expect(s2.lastResult).toBe("timeout");
    expect(s2.timeLeft).toBe(0);
  });

  it("tick is no-op outside playing phase", () => {
    const s = initialState(42, med);
    const s2 = reducer(s, { type: "tick", elapsed: 100 });
    expect(s2.phase).toBe("idle");
  });
});

describe("OddShapeOut progression", () => {
  function playAll(seed: number) {
    let s = reducer(initialState(seed, easy), { type: "start" });
    for (let round = 0; round < 20; round++) {
      s = reducer(s, { type: "pick", index: s.oddIndex }); // always correct
      s = reducer(s, { type: "next" });
    }
    return s;
  }

  it("done after 20 rounds", () => {
    expect(playAll(42).phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    const s = playAll(42);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns null when not done", () => {
    expect(isTerminal(initialState(42, med))).toBeNull();
  });

  it("correct count tracks right answers", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    // Correct first 5, wrong next 5
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "pick", index: s.oddIndex });
      s = reducer(s, { type: "next" });
    }
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "pick", index: (s.oddIndex + 1) % 8 });
      s = reducer(s, { type: "next" });
    }
    expect(s.correct).toBe(5);
  });
});
