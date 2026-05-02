import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS, GRID_SIZE } from "./state.js";

const settings = { variation: "obvious" as const };

describe("ClickTheDifference initialState", () => {
  it("starts in playing phase, round 1, score 0", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("playing");
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
    expect(s.solved).toBe(false);
    expect(s.attempts).toBe(0);
  });

  it("grids are 4x4 = 16 cells", () => {
    const s = initialState(42, settings);
    expect(s.current.gridA).toHaveLength(GRID_SIZE * GRID_SIZE);
    expect(s.current.gridB).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  it("gridA and gridB differ at exactly one index = diffIndex", () => {
    for (let seed = 1; seed < 30; seed++) {
      const s = initialState(seed, settings);
      let diffs = 0;
      for (let i = 0; i < s.current.gridA.length; i++) {
        if (s.current.gridA[i] !== s.current.gridB[i]) diffs++;
      }
      expect(diffs).toBe(1);
      expect(s.current.gridA[s.current.diffIndex]).not.toBe(
        s.current.gridB[s.current.diffIndex],
      );
    }
  });

  it("same seed produces same initial round", () => {
    const a = initialState(7, settings);
    const b = initialState(7, settings);
    expect(a.current.gridA).toEqual(b.current.gridA);
    expect(a.current.gridB).toEqual(b.current.gridB);
    expect(a.current.diffIndex).toBe(b.current.diffIndex);
  });
});

describe("ClickTheDifference reducer", () => {
  it("clicking the diffIndex solves the round and adds score", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "click", idx: s.current.diffIndex });
    expect(s.solved).toBe(true);
    expect(s.score).toBe(10);
    expect(s.correctRounds).toBe(1);
  });

  it("wrong click increments attempts and reduces eventual reward", () => {
    let s = initialState(42, settings);
    const wrong = (s.current.diffIndex + 1) % 16;
    const wrong2 = (s.current.diffIndex + 2) % 16;
    s = reducer(s, { type: "click", idx: wrong });
    s = reducer(s, { type: "click", idx: wrong2 });
    expect(s.attempts).toBe(2);
    expect(s.solved).toBe(false);
    s = reducer(s, { type: "click", idx: s.current.diffIndex });
    expect(s.score).toBe(10 - 2 * 2);
  });

  it("score has a minimum of 1 even with many wrong clicks", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 16; i++) {
      if (i === s.current.diffIndex) continue;
      s = reducer(s, { type: "click", idx: i });
    }
    s = reducer(s, { type: "click", idx: s.current.diffIndex });
    expect(s.score).toBe(1);
  });

  it("next without solving is a no-op", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "next" });
    expect(after).toBe(s);
  });

  it("game ends after 10 solved rounds", () => {
    let s = initialState(42, settings);
    for (let r = 0; r < ROUNDS; r++) {
      s = reducer(s, { type: "click", idx: s.current.diffIndex });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).toEqual({ score: ROUNDS * 10 });
  });

  it("clicking after solved is a no-op", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "click", idx: s.current.diffIndex });
    const after = reducer(s, { type: "click", idx: 0 });
    expect(after).toBe(s);
  });
});
