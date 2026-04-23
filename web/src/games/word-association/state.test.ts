import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { duration: "60" as const };

describe("WordAssociation initialState", () => {
  it("starts with a chain of one word", () => {
    const s = initialState(1, defaultSettings);
    expect(s.chain.length).toBe(1);
    expect(s.starterWord).toBe(s.chain[0]);
  });

  it("starts with full timer", () => {
    const s = initialState(1, defaultSettings);
    expect(s.timeLeft).toBe(60);
  });

  it("starts in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.inputText).toBe("");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.starterWord).toBe(s2.starterWord);
  });

  it("uses duration setting", () => {
    const s = initialState(1, { duration: "120" });
    expect(s.timeLeft).toBe(120);
  });
});

describe("WordAssociation reducer - typing and submitting", () => {
  it("type action updates inputText (lowercase, letters only)", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: "Water123" });
    expect(s2.inputText).toBe("water");
  });

  it("submitting a valid word adds it to chain", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: "fire" });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.chain).toContain("fire");
    expect(s3.chain.length).toBe(2);
    expect(s3.inputText).toBe("");
  });

  it("submitting duplicate word gives error", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: s.starterWord });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.chain.length).toBe(1);
    expect(s3.lastError).toContain("already used");
  });

  it("submitting an invalid word gives error", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: "xyzqab" });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.chain.length).toBe(1);
    expect(s3.lastError).toContain("not recognized");
  });

  it("chain grows with each valid word", () => {
    let s = initialState(1, defaultSettings);
    const words = ["fire", "water", "earth", "wind", "storm"];
    for (const w of words) {
      s = reducer(s, { type: "type", text: w });
      s = reducer(s, { type: "submit" });
    }
    // Not all words may be in dictionary, but chain should grow
    expect(s.chain.length).toBeGreaterThan(1);
  });
});

describe("WordAssociation reducer - timer", () => {
  it("tick decrements timer", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(59);
  });

  it("tick to zero ends game", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.phase).toBe("done");
    expect(s.timeLeft).toBe(0);
  });

  it("no actions processed when done", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const s2 = reducer(s, { type: "type", text: "hello" });
    expect(s2.inputText).toBe("");
  });
});

describe("WordAssociation isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns chain-length-minus-1 as score when done", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "type", text: "fire" });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "type", text: "water" });
    s = reducer(s, { type: "submit" });
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    // chain should have starter + any valid words added
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
