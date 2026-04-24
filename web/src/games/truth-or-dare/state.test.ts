import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "10" as const, mode: "family" as const };

describe("TruthOrDare initialState", () => {
  it("creates correct number of cards", () => {
    const s = initialState(1, defaultSettings);
    expect(s.cards.length).toBe(10);
  });

  it("starts in pick phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("pick");
    expect(s.currentIndex).toBe(0);
    expect(s.completed).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    expect(s1.cards.map(c => c.text)).toEqual(s2.cards.map(c => c.text));
  });

  it("each card has kind and text", () => {
    const s = initialState(1, defaultSettings);
    for (const c of s.cards) {
      expect(["truth", "dare"]).toContain(c.kind);
      expect(typeof c.text).toBe("string");
      expect(c.text.length).toBeGreaterThan(0);
    }
  });
});

describe("TruthOrDare reducer - pick", () => {
  it("picking truth moves to show with truth kind", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "pick", choice: "truth" });
    expect(s2.phase).toBe("show");
    expect(s2.cards[0]!.kind).toBe("truth");
  });

  it("picking dare moves to show with dare kind", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "pick", choice: "dare" });
    expect(s2.phase).toBe("show");
    expect(s2.cards[0]!.kind).toBe("dare");
  });
});

describe("TruthOrDare reducer - next", () => {
  it("next advances to next card", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "pick", choice: "truth" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBe(1);
    expect(s.phase).toBe("pick");
    expect(s.completed).toBe(1);
  });

  it("finishes after all rounds", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "family" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "pick", choice: "dare" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

describe("TruthOrDare isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, { rounds: "10" as const, mode: "family" as const });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "pick", choice: "truth" });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(typeof t!.score).toBe("number");
  });
});
