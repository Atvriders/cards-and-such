import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AcrobatFlipSettings } from "./state.js";

const s5: AcrobatFlipSettings = { flips: "5" };
const s8: AcrobatFlipSettings = { flips: "8" };

describe("AcrobatFlip initialState", () => {
  it("totalFlips is 5", () => {
    expect(initialState(1, s5).totalFlips).toBe(5);
  });

  it("totalFlips is 8", () => {
    expect(initialState(1, s8).totalFlips).toBe(8);
  });

  it("starts at flip 1", () => {
    expect(initialState(1, s5).flipNum).toBe(1);
  });

  it("starts with 0 score", () => {
    expect(initialState(1, s5).score).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s5).gameOver).toBe(false);
  });
});

describe("AcrobatFlip reducer", () => {
  it("nextFlip without landing advances angle", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "nextFlip" });
    expect(s2.angle).not.toBe(s.angle);
  });

  it("land records quality", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "land" });
    expect(s2.quality).not.toBeNull();
    expect(s2.history).toHaveLength(1);
  });

  it("nextFlip after landing advances flip number", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "land" });
    s = reducer(s, { type: "nextFlip" });
    expect(s.flipNum).toBe(2);
    expect(s.quality).toBeNull();
  });

  it("game over after all flips", () => {
    // do all flips
    let s2 = initialState(1, s5);
    for (let i = 0; i < 5; i++) {
      s2 = reducer(s2, { type: "land" });
      s2 = reducer(s2, { type: "nextFlip" });
    }
    expect(s2.gameOver).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "land" });
    s = reducer(s, { type: "restart" });
    expect(s.flipNum).toBe(1);
    expect(s.score).toBe(0);
  });
});

describe("AcrobatFlip isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 400 };
    expect(isTerminal(s)!.score).toBe(400);
  });

  it("score capped at 1000", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 9999 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});
