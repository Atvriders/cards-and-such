import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { dots: "10" as const };

describe("initialState", () => {
  it("generates correct number of dots", () => {
    const s = initialState(42, def);
    expect(s.points.length).toBe(10);
    expect(s.totalDots).toBe(10);
  });

  it("starts at dot 1 with no mistakes", () => {
    const s = initialState(42, def);
    expect(s.nextDot).toBe(1);
    expect(s.mistakes).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("dots are numbered 1 to N", () => {
    const s = initialState(7, def);
    const nums = s.points.map(p => p.num).sort((a, b) => a - b);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, def);
    const s2 = initialState(99, def);
    expect(s1.points[0]).toEqual(s2.points[0]);
  });
});

describe("reducer — correct click", () => {
  it("advances nextDot on correct click", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "click-dot", num: 1 });
    expect(s2.nextDot).toBe(2);
    expect(s2.mistakes).toBe(0);
  });

  it("completes game after last dot", () => {
    let s = initialState(42, def);
    for (let i = 1; i <= 10; i++) {
      s = reducer(s, { type: "click-dot", num: i });
    }
    expect(s.gameOver).toBe(true);
    expect(s.completed).toBe(true);
  });
});

describe("reducer — wrong click", () => {
  it("increments mistakes on wrong click", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "click-dot", num: 5 });
    expect(s2.mistakes).toBe(1);
    expect(s2.nextDot).toBe(1); // unchanged
  });

  it("no-op after game over", () => {
    const s = { ...initialState(42, def), gameOver: true };
    const s2 = reducer(s, { type: "click-dot", num: 1 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("perfect score = totalDots * 20", () => {
    const s = { ...initialState(42, def), gameOver: true, totalDots: 10, mistakes: 0 };
    expect(isTerminal(s)!.score).toBe(200);
  });

  it("deducts 10 per mistake", () => {
    const s = { ...initialState(42, def), gameOver: true, totalDots: 10, mistakes: 3 };
    expect(isTerminal(s)!.score).toBe(170);
  });

  it("score cannot go below 0", () => {
    const s = { ...initialState(42, def), gameOver: true, totalDots: 10, mistakes: 100 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
