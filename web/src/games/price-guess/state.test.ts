import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const ten = { items: "10" as const };

describe("PriceGuess initialState", () => {
  it("creates the correct number of items", () => {
    const s = initialState(1, ten);
    expect(s.items.length).toBe(10);
  });

  it("starts in guessing phase at index 0", () => {
    const s = initialState(1, ten);
    expect(s.phase).toBe("guessing");
    expect(s.currentIndex).toBe(0);
    expect(s.totalScore).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, ten);
    const s2 = initialState(7, ten);
    expect(s1.items.map(i => i.name)).toEqual(s2.items.map(i => i.name));
  });

  it("all items have positive target price", () => {
    const s = initialState(1, ten);
    expect(s.items.every(i => i.target > 0)).toBe(true);
  });
});

describe("PriceGuess reducer", () => {
  it("set_input updates guessInput", () => {
    const s = initialState(1, ten);
    const s2 = reducer(s, { type: "set_input", value: "5.00" });
    expect(s2.guessInput).toBe("5.00");
  });

  it("submit with exact price gives 1000 points and win", () => {
    const s = initialState(1, ten);
    const target = s.items[0]!.target;
    const s2 = reducer({ ...s, guessInput: String(target) }, { type: "submit" });
    expect(s2.phase).toBe("result");
    expect(s2.roundScore).toBe(1000);
    expect(s2.won).toBe(1);
  });

  it("submit with far-off price gives 0 points", () => {
    const s = initialState(1, ten);
    const target = s.items[0]!.target;
    const farOff = target * 10;
    const s2 = reducer({ ...s, guessInput: String(farOff) }, { type: "submit" });
    expect(s2.roundScore).toBe(0);
    expect(s2.won).toBe(0);
  });

  it("next advances to next item", () => {
    const s = initialState(1, ten);
    const s2 = reducer({ ...s, guessInput: "5" }, { type: "submit" });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.currentIndex).toBe(1);
    expect(s3.phase).toBe("guessing");
  });

  it("next on last item sets phase to done", () => {
    const s = initialState(1, ten);
    let cur = { ...s, currentIndex: 9 };
    cur = reducer({ ...cur, guessInput: "5" }, { type: "submit" });
    cur = reducer(cur, { type: "next" });
    expect(cur.phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(1, ten);
    expect(isTerminal(s)).toBeNull();
    const done = { ...s, phase: "done" as const, totalScore: 5000 };
    expect(isTerminal(done)).toEqual({ score: 5000 });
  });
});
