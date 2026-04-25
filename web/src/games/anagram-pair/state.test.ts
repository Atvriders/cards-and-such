import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { pairCount: "4" as const };

describe("AnagramPair initialState", () => {
  it("creates correct number of pairs", () => {
    const s = initialState(42, defaultSettings);
    expect(s.pairs.length).toBe(4);
    expect(s.leftItems.length).toBe(4);
    expect(s.rightItems.length).toBe(4);
    expect(s.matched.size).toBe(0);
    expect(s.done).toBe(false);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.leftItems).toEqual(s2.leftItems);
  });

  it("left items are the words from pairs", () => {
    const s = initialState(5, defaultSettings);
    const wordSet = new Set(s.pairs.map((p) => p.word));
    s.leftItems.forEach((w) => expect(wordSet.has(w)).toBe(true));
  });

  it("right items are the anagrams from pairs", () => {
    const s = initialState(5, defaultSettings);
    const anaSet = new Set(s.pairs.map((p) => p.anagram));
    s.rightItems.forEach((a) => expect(anaSet.has(a)).toBe(true));
  });

  it("each pair's word and anagram use the same letters", () => {
    const s = initialState(42, defaultSettings);
    for (const pair of s.pairs) {
      const sorted = (w: string) => w.split("").sort().join("");
      expect(sorted(pair.word)).toBe(sorted(pair.anagram));
    }
  });
});

describe("AnagramPair reducer", () => {
  it("correct match increases score and adds to matched", () => {
    const s = initialState(42, defaultSettings);
    const word = s.leftItems[0]!;
    const pair = s.pairs.find((p) => p.word === word)!;
    const ri = s.rightItems.indexOf(pair.anagram);

    let state = reducer(s, { type: "selectLeft", index: 0 });
    state = reducer(state, { type: "selectRight", index: ri });

    expect(state.matched.size).toBe(1);
    expect(state.score).toBe(10);
  });

  it("wrong match sets wrong field", () => {
    const s = initialState(42, defaultSettings);
    const word = s.leftItems[0]!;
    const pair = s.pairs.find((p) => p.word === word)!;
    const correctRi = s.rightItems.indexOf(pair.anagram);
    const wrongRi = correctRi === 0 ? 1 : 0;

    let state = reducer(s, { type: "selectLeft", index: 0 });
    state = reducer(state, { type: "selectRight", index: wrongRi });

    expect(state.wrong).not.toBeNull();
    expect(state.score).toBe(0);
  });

  it("clearWrong resets state", () => {
    const s = { ...initialState(42, defaultSettings), wrong: [0, 1] as [number, number], selectedLeft: 0 };
    const s2 = reducer(s, { type: "clearWrong" });
    expect(s2.wrong).toBeNull();
    expect(s2.selectedLeft).toBeNull();
  });

  it("matching all pairs sets done", () => {
    let state = initialState(42, defaultSettings);
    for (let li = 0; li < state.pairs.length; li++) {
      const word = state.leftItems[li]!;
      const pair = state.pairs.find((p) => p.word === word)!;
      const ri = state.rightItems.indexOf(pair.anagram);
      state = reducer(state, { type: "selectLeft", index: li });
      state = reducer(state, { type: "selectRight", index: ri });
    }
    expect(state.done).toBe(true);
    expect(state.score).toBe(40);
  });
});

describe("AnagramPair isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, defaultSettings), done: true, score: 60 };
    expect(isTerminal(s)?.score).toBe(60);
  });
});
