import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  buildDeck,
  shuffle,
  colorOf,
  ROUNDS,
  HAND_SIZE,
} from "./state.js";

const settings = { difficulty: "normal" as const };

describe("CardShufflePro deck", () => {
  it("buildDeck returns 52 unique cards", () => {
    const d = buildDeck();
    expect(d).toHaveLength(52);
    const seen = new Set(d.map((c) => `${c.suit}${c.rank}`));
    expect(seen.size).toBe(52);
  });

  it("shuffle preserves the multiset of cards", () => {
    const d = buildDeck();
    const s = shuffle(d, 123, 0);
    expect(s).toHaveLength(52);
    const ids = s.map((c) => `${c.suit}${c.rank}`).sort();
    const original = d.map((c) => `${c.suit}${c.rank}`).sort();
    expect(ids).toEqual(original);
  });

  it("shuffle is deterministic given seed and counter", () => {
    const a = shuffle(buildDeck(), 7, 3);
    const b = shuffle(buildDeck(), 7, 3);
    expect(a).toEqual(b);
  });

  it("colorOf returns red for hearts/diamonds, black for spades/clubs", () => {
    expect(colorOf({ suit: "H", rank: 5 })).toBe("red");
    expect(colorOf({ suit: "D", rank: 5 })).toBe("red");
    expect(colorOf({ suit: "S", rank: 5 })).toBe("black");
    expect(colorOf({ suit: "C", rank: 5 })).toBe("black");
  });
});

describe("CardShufflePro initialState", () => {
  it("starts in guess phase with 5 cards visible and a hidden next", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("guess");
    expect(s.hand).toHaveLength(HAND_SIZE);
    expect(s.next).toBeDefined();
    expect(s.revealed).toBe(false);
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });

  it("hand and next are 6 distinct cards from the deck", () => {
    const s = initialState(99, settings);
    const ids = [...s.hand, s.next].map((c) => `${c.suit}${c.rank}`);
    const set = new Set(ids);
    expect(set.size).toBe(6);
  });
});

describe("CardShufflePro reducer", () => {
  it("guess reveals next and updates score on correct", () => {
    let s = initialState(42, settings);
    const truth = colorOf(s.next);
    s = reducer(s, { type: "guess", color: truth });
    expect(s.revealed).toBe(true);
    expect(s.score).toBe(1);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].correct).toBe(true);
  });

  it("guess does not score on wrong", () => {
    let s = initialState(42, settings);
    const truth = colorOf(s.next);
    const wrong = truth === "red" ? "black" : "red";
    s = reducer(s, { type: "guess", color: wrong });
    expect(s.score).toBe(0);
    expect(s.history[0].correct).toBe(false);
  });

  it("next deals a new round and finishes after 12", () => {
    let s = initialState(1, settings);
    for (let r = 0; r < ROUNDS; r++) {
      const truth = colorOf(s.next);
      s = reducer(s, { type: "guess", color: truth });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).toEqual({ score: ROUNDS });
  });

  it("ignores guess after revealed and next before revealed", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "next" }); // should be ignored, not revealed yet
    expect(s.revealed).toBe(false);
    s = reducer(s, { type: "guess", color: "red" });
    const after = reducer(s, { type: "guess", color: "black" });
    expect(after).toBe(s); // no-op while revealed
  });
});
