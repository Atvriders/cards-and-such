import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10_8 = { chips: "10" as const, rows: "8" as const };
const s5_8 = { chips: "5" as const, rows: "8" as const };
const s5_16 = { chips: "5" as const, rows: "16" as const };

describe("Plinko initialState", () => {
  it("sets up correct chip count and zero score", () => {
    const s = initialState(42, s10_8);
    expect(s.totalChips).toBe(10);
    expect(s.chipsUsed).toBe(0);
    expect(s.score).toBe(0);
    expect(s.history.length).toBe(0);
    expect(s.animating).toBeNull();
  });

  it("slot values length = rows + 1", () => {
    const s8 = initialState(1, { chips: "5" as const, rows: "8" as const });
    expect(s8.slotValues.length).toBe(9);
    const s16 = initialState(1, s5_16);
    expect(s16.slotValues.length).toBe(17);
  });

  it("center slot has highest value", () => {
    const s = initialState(1, s10_8);
    const center = Math.floor(s.slotValues.length / 2);
    const maxVal = Math.max(...s.slotValues);
    expect(s.slotValues[center]).toBe(maxVal);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(77, s10_8);
    const s2 = initialState(77, s10_8);
    expect(s1.slotValues).toEqual(s2.slotValues);
  });
});

describe("Plinko drop", () => {
  it("drop increments chipsUsed and adds to history", () => {
    const s = initialState(42, s5_8);
    const s2 = reducer(s, { type: "drop" });
    expect(s2.chipsUsed).toBe(1);
    expect(s2.history.length).toBe(1);
  });

  it("drop adds chip points to score", () => {
    const s = initialState(42, s5_8);
    const s2 = reducer(s, { type: "drop" });
    const chip = s2.history[0]!;
    expect(s2.score).toBe(chip.points);
  });

  it("chip path length equals row count", () => {
    const s = initialState(42, s5_8);
    const s2 = reducer(s, { type: "drop" });
    const chip = s2.history[0]!;
    expect(chip.decisions.length).toBe(8);
  });

  it("slot index consistent with decisions (count of true decisions)", () => {
    const s = initialState(42, s5_8);
    const s2 = reducer(s, { type: "drop" });
    const chip = s2.history[0]!;
    const countRight = chip.decisions.filter(Boolean).length;
    expect(chip.slot).toBe(countRight);
  });

  it("no drop when all chips used", () => {
    let s = initialState(42, s5_8);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "drop" });
    }
    expect(s.chipsUsed).toBe(5);
    const s2 = reducer(s, { type: "drop" });
    expect(s2.chipsUsed).toBe(5); // no-op
  });

  it("multiple drops accumulate score", () => {
    let s = initialState(42, s10_8);
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "drop" });
    const expectedScore = s.history.reduce((acc, c) => acc + c.points, 0);
    expect(s.score).toBe(expectedScore);
  });
});

describe("Plinko isTerminal", () => {
  it("returns null while chips remain", () => {
    const s = initialState(42, s5_8);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all chips used", () => {
    let s = initialState(42, s5_8);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "drop" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(s.score);
  });

  it("is deterministic — same seed gives same score", () => {
    const play = (seed: number) => {
      let s = initialState(seed, s5_8);
      for (let i = 0; i < 5; i++) s = reducer(s, { type: "drop" });
      return s.score;
    };
    expect(play(100)).toBe(play(100));
    // Different seeds should (very likely) differ
    const a = play(1);
    const b = play(2);
    // Not guaranteed to differ but overwhelmingly likely — just verify they run
    expect(typeof a).toBe("number");
    expect(typeof b).toBe("number");
  });
});
