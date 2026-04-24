import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "6" as const };
const hard = { difficulty: "9" as const };

describe("ImageMemory initialState", () => {
  it("starts idle with no icons", () => {
    const s = initialState(42, easy);
    expect(s.phase).toBe("idle");
    expect(s.icons.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("deterministic with same seed", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("ImageMemory start", () => {
  it("enters showing phase with correct icon count", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.icons.length).toBe(6);
    expect(s2.showOrder.length).toBe(6);
    expect(s2.flashIndex).toBe(0);
    expect(s2.round).toBe(1);
  });

  it("hard uses 9 icons", () => {
    const s = initialState(42, hard);
    const s2 = reducer(s, { type: "start" });
    expect(s2.icons.length).toBe(9);
    expect(s2.showOrder.length).toBe(9);
  });

  it("showOrder is a permutation of indices", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    const sorted = [...s2.showOrder].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("same seed same icons and order", () => {
    const start = (seed: number) => {
      const s = initialState(seed, easy);
      const s2 = reducer(s, { type: "start" });
      return { icons: [...s2.icons], order: [...s2.showOrder] };
    };
    const a = start(10);
    const b = start(10);
    expect(a.icons).toEqual(b.icons);
    expect(a.order).toEqual(b.order);
  });
});

describe("ImageMemory advance-flash", () => {
  it("advances flashIndex", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "advance-flash" });
    expect(s3.flashIndex).toBe(1);
    expect(s3.phase).toBe("showing");
  });

  it("transitions to input after last flash", () => {
    let s = initialState(42, { difficulty: "6" as const });
    s = reducer(s, { type: "start" });
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "advance-flash" });
    }
    expect(s.phase).toBe("input");
  });
});

describe("ImageMemory click-icon", () => {
  function reachInput(seed: number) {
    let s = initialState(seed, easy);
    s = reducer(s, { type: "start" });
    for (let i = 0; i < 6; i++) s = reducer(s, { type: "advance-flash" });
    return s;
  }

  it("correct first click advances step", () => {
    const s = reachInput(42);
    const firstExpected = s.showOrder[0]!;
    const s2 = reducer(s, { type: "click-icon", index: firstExpected });
    expect(s2.playerStep).toBe(1);
    expect(s2.correctClicks).toContain(firstExpected);
    expect(s2.phase).toBe("input");
  });

  it("wrong click ends round with partial credit", () => {
    const s = reachInput(42);
    const wrong = (s.showOrder[0]! + 1) % 6;
    const s2 = reducer(s, { type: "click-icon", index: wrong });
    expect(s2.phase).toBe("result");
    expect(s2.correctClicks.length).toBe(0);
  });

  it("correct full sequence completes round perfectly", () => {
    let s = reachInput(42);
    for (const idx of s.showOrder) {
      s = reducer(s, { type: "click-icon", index: idx });
    }
    expect(s.phase).toBe("result");
    expect(s.lastRoundCorrect).toBe(true);
    expect(s.correctClicks.length).toBe(6);
  });

  it("click-icon is no-op when not input phase", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "click-icon", index: 0 });
    expect(s2.phase).toBe("idle");
  });
});

describe("ImageMemory next and done", () => {
  it("next advances round", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    for (let i = 0; i < 6; i++) s = reducer(s, { type: "advance-flash" });
    s = reducer(s, { type: "click-icon", index: (s.showOrder[0]! + 1) % 6 }); // wrong -> result
    s = reducer(s, { type: "next" });
    expect(s.round).toBe(2);
    expect(s.phase).toBe("showing");
  });

  it("done after 5 rounds", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < 6; i++) s = reducer(s, { type: "advance-flash" });
      s = reducer(s, { type: "click-icon", index: (s.showOrder[0]! + 1) % 6 }); // quick wrong
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(42, easy);
    s = reducer(s, { type: "start" });
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < 6; i++) s = reducer(s, { type: "advance-flash" });
      s = reducer(s, { type: "click-icon", index: (s.showOrder[0]! + 1) % 6 });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(typeof t!.score).toBe("number");
  });
});
