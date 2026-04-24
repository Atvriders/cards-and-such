import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { pairCount: "4" as const };

describe("SynonymMatch initialState", () => {
  it("creates the correct number of pairs", () => {
    const s = initialState(42, defaultSettings);
    expect(s.pairs.length).toBe(4);
    expect(s.leftItems.length).toBe(4);
    expect(s.rightItems.length).toBe(4);
    expect(s.matched.size).toBe(0);
    expect(s.done).toBe(false);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.pairs.map(p => p.word)).toEqual(s2.pairs.map(p => p.word));
    expect(s1.leftItems).toEqual(s2.leftItems);
  });

  it("left items are the words from pairs", () => {
    const s = initialState(5, defaultSettings);
    const wordSet = new Set(s.pairs.map(p => p.word));
    s.leftItems.forEach(w => expect(wordSet.has(w)).toBe(true));
  });

  it("right items are the synonyms from pairs", () => {
    const s = initialState(5, defaultSettings);
    const synSet = new Set(s.pairs.map(p => p.synonym));
    s.rightItems.forEach(syn => expect(synSet.has(syn)).toBe(true));
  });
});

describe("SynonymMatch reducer", () => {
  it("selectLeft sets selectedLeft", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "selectLeft", index: 0 });
    expect(s2.selectedLeft).toBe(0);
  });

  it("correct match increases score and adds to matched set", () => {
    const s = initialState(42, defaultSettings);
    // Find index 0 word in leftItems, find its synonym in rightItems
    const word = s.leftItems[0]!;
    const pair = s.pairs.find(p => p.word === word)!;
    const rightIdx = s.rightItems.indexOf(pair.synonym);

    let state = reducer(s, { type: "selectLeft", index: 0 });
    state = reducer(state, { type: "selectRight", index: rightIdx });

    expect(state.matched.size).toBe(1);
    expect(state.score).toBe(10);
    expect(state.selectedLeft).toBeNull();
  });

  it("wrong match sets wrong field", () => {
    const s = initialState(42, defaultSettings);
    const word = s.leftItems[0]!;
    const pair = s.pairs.find(p => p.word === word)!;
    const rightIdx = s.rightItems.indexOf(pair.synonym);
    // Pick a DIFFERENT right index (not the correct one)
    const wrongRightIdx = rightIdx === 0 ? 1 : 0;
    // Make sure it's not already matched (it won't be in initial state)
    let state = reducer(s, { type: "selectLeft", index: 0 });
    state = reducer(state, { type: "selectRight", index: wrongRightIdx });

    expect(state.wrong).not.toBeNull();
    expect(state.score).toBe(0);
    expect(state.matched.size).toBe(0);
  });

  it("clearWrong resets wrong and selection", () => {
    const s = initialState(42, defaultSettings);
    const fakeState = { ...s, wrong: [0, 1] as [number, number], selectedLeft: 0 };
    const s2 = reducer(fakeState, { type: "clearWrong" });
    expect(s2.wrong).toBeNull();
    expect(s2.selectedLeft).toBeNull();
  });

  it("matching all pairs sets done to true", () => {
    let state = initialState(42, defaultSettings);
    for (let li = 0; li < state.pairs.length; li++) {
      const word = state.leftItems[li]!;
      const pair = state.pairs.find(p => p.word === word)!;
      const ri = state.rightItems.indexOf(pair.synonym);
      state = reducer(state, { type: "selectLeft", index: li });
      state = reducer(state, { type: "selectRight", index: ri });
    }
    expect(state.done).toBe(true);
    expect(state.score).toBe(40);
  });
});

describe("SynonymMatch isTerminal", () => {
  it("returns null while game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done is true", () => {
    const s = { ...initialState(42, defaultSettings), done: true, score: 40 };
    expect(isTerminal(s)?.score).toBe(40);
  });
});
