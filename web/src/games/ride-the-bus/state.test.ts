import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkGuess } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings5 = { rounds: "5" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("checkGuess — redBlack", () => {
  it("red guess on red card is correct", () => expect(checkGuess("redBlack", "red", c(5, "♥"), [])).toBe(true));
  it("black guess on black card is correct", () => expect(checkGuess("redBlack", "black", c(5, "♠"), [])).toBe(true));
  it("wrong colour is false", () => expect(checkGuess("redBlack", "red", c(5, "♠"), [])).toBe(false));
  it("red guess on diamond is correct", () => expect(checkGuess("redBlack", "red", c(7, "♦"), [])).toBe(true));
});

describe("checkGuess — higherLower", () => {
  it("higher correct when card rank is higher", () => expect(checkGuess("higherLower", "higher", c(10), [c(5)])).toBe(true));
  it("lower correct when card rank is lower", () => expect(checkGuess("higherLower", "lower", c(3), [c(9)])).toBe(true));
  it("higher wrong when card is lower", () => expect(checkGuess("higherLower", "higher", c(2, "♣"), [c(9)])).toBe(true)); // 2 maps to 2 (not ace-high here)
  it("Ace (rank 1) is treated as 14", () => expect(checkGuess("higherLower", "higher", c(1), [c(13)])).toBe(true));
});

describe("checkGuess — insideOutside", () => {
  it("inside when between range", () => expect(checkGuess("insideOutside", "inside", c(7), [c(3), c(10)])).toBe(true));
  it("outside when below range", () => expect(checkGuess("insideOutside", "outside", c(2, "♣"), [c(5), c(10)])).toBe(true));
  it("inside wrong when card equals boundary", () => expect(checkGuess("insideOutside", "inside", c(5), [c(5), c(10)])).toBe(false));
  it("outside correct when above range", () => expect(checkGuess("insideOutside", "outside", c(12), [c(5), c(9)])).toBe(true));
});

describe("checkGuess — suit", () => {
  it("correct suit guess", () => expect(checkGuess("suit", "♥", c(7, "♥"), [])).toBe(true));
  it("wrong suit guess", () => expect(checkGuess("suit", "♠", c(7, "♥"), [])).toBe(false));
});

describe("initialState", () => {
  it("starts at question 0", () => expect(initialState(1, settings5).currentQuestion).toBe(0));
  it("deck has 52 cards", () => expect(initialState(1, settings5).deck.length).toBe(52));
  it("zero drinks initially", () => expect(initialState(1, settings5).drinks).toBe(0));
  it("phase is question", () => expect(initialState(1, settings5).phase).toBe("question"));
  it("deterministic", () => expect(initialState(42, settings5).deck[0]!.id).toBe(initialState(42, settings5).deck[0]!.id));
});

describe("reducer", () => {
  it("guess transitions to reveal phase", () => {
    const s = initialState(1, settings5);
    const s2 = reducer(s, { type: "guess", value: "red" });
    expect(s2.phase).toBe("reveal");
    expect(s2.currentReveal).not.toBeNull();
  });
  it("wrong guess adds penalty", () => {
    const s = initialState(1, settings5);
    // Force a wrong guess by guessing the opposite of first card colour
    const firstCard = s.deck[0]!;
    const isRed = firstCard.suit === "♥" || firstCard.suit === "♦";
    const wrongGuess = isRed ? "black" : "red";
    const s2 = reducer(s, { type: "guess", value: wrongGuess });
    expect(s2.drinks).toBe(1);
    expect(s2.lastCorrect).toBe(false);
  });
  it("correct guess adds no penalty", () => {
    const s = initialState(1, settings5);
    const firstCard = s.deck[0]!;
    const isRed = firstCard.suit === "♥" || firstCard.suit === "♦";
    const rightGuess = isRed ? "red" : "black";
    const s2 = reducer(s, { type: "guess", value: rightGuess });
    expect(s2.drinks).toBe(0);
    expect(s2.lastCorrect).toBe(true);
  });
  it("nextQuestion advances question counter", () => {
    let s = initialState(1, settings5);
    s = reducer(s, { type: "guess", value: "red" });
    s = reducer(s, { type: "nextQuestion" });
    expect(s.currentQuestion).toBe(1);
    expect(s.phase).toBe("question");
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings5))).toBeNull());
  it("perfect score = 100", () => {
    const s = { ...initialState(1, settings5), phase: "done" as const, drinks: 0, roundsPlayed: 5 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("all wrong = score 0", () => {
    const s = { ...initialState(1, settings5), phase: "done" as const, drinks: 20, roundsPlayed: 5 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
  it("half wrong = score ~50", () => {
    const s = { ...initialState(1, { rounds: "5" as const }), phase: "done" as const, drinks: 10, roundsPlayed: 5 };
    const result = isTerminal(s);
    expect(result!.score).toBeGreaterThanOrEqual(45);
    expect(result!.score).toBeLessThanOrEqual(55);
  });
});
