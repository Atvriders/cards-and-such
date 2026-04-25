import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const prefixSettings = { questionCount: "5" as const, mode: "prefix" as const };
const suffixSettings = { questionCount: "5" as const, mode: "suffix" as const };
const mixedSettings = { questionCount: "10" as const, mode: "mixed" as const };

describe("PrefixSuffix initialState", () => {
  it("creates correct number of prefix entries", () => {
    const s = initialState(42, prefixSettings);
    expect(s.entries.length).toBe(5);
    expect(s.entries.every((e) => e.type === "prefix")).toBe(true);
  });

  it("creates correct number of suffix entries", () => {
    const s = initialState(42, suffixSettings);
    expect(s.entries.length).toBe(5);
    expect(s.entries.every((e) => e.type === "suffix")).toBe(true);
  });

  it("mixed mode has both types", () => {
    const s = initialState(42, mixedSettings);
    expect(s.entries.length).toBe(10);
    const hasPre = s.entries.some((e) => e.type === "prefix");
    const hasSuf = s.entries.some((e) => e.type === "suffix");
    expect(hasPre || hasSuf).toBe(true);
  });

  it("each entry has 4 choices including the answer", () => {
    const s = initialState(99, prefixSettings);
    for (const entry of s.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.meaning);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, prefixSettings);
    const s2 = initialState(7, prefixSettings);
    expect(s1.entries.map((e) => e.affix)).toEqual(s2.entries.map((e) => e.affix));
  });
});

describe("PrefixSuffix reducer", () => {
  it("correct selection scores 10", () => {
    const s = initialState(42, prefixSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.meaning);
    const s2 = reducer(s, { type: "select", index: correctIdx });
    expect(s2.score).toBe(10);
  });

  it("wrong selection scores 0", () => {
    const s = initialState(42, prefixSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.meaning);
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    const s2 = reducer(s, { type: "select", index: wrongIdx });
    expect(s2.score).toBe(0);
  });

  it("cannot select again after answering", () => {
    const s = initialState(42, prefixSettings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "select", index: 1 });
    expect(s3.selected).toBe(s2.selected);
  });

  it("next advances current", () => {
    let s = initialState(42, prefixSettings);
    s = reducer(s, { type: "select", index: 0 });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
  });

  it("completing all questions sets done", () => {
    let s = initialState(42, prefixSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
  });
});

describe("PrefixSuffix isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(42, prefixSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, prefixSettings), done: true, score: 40 };
    expect(isTerminal(s)?.score).toBe(40);
  });
});
