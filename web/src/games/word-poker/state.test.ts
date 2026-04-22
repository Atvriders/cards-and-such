import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, botBestWord } from "./state.js";
import { scoreWord, isValidWord, LETTER_VALUES } from "./words.js";

const defaultSettings = { rounds: "5" as const };

describe("WordPoker initialState", () => {
  it("deals 7 cards", () => {
    const s = initialState(1, defaultSettings);
    expect(s.hand.length).toBe(7);
  });

  it("all cards have valid letters and values", () => {
    const s = initialState(1, defaultSettings);
    s.hand.forEach(card => {
      expect(/^[A-Z]$/.test(card.letter)).toBe(true);
      expect(card.value).toBeGreaterThan(0);
      expect(card.value).toBe(LETTER_VALUES[card.letter] ?? 1);
    });
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.hand.map(c => c.letter)).toEqual(s2.hand.map(c => c.letter));
  });

  it("starts with no selection and no score", () => {
    const s = initialState(1, defaultSettings);
    expect(s.selectedIds).toEqual([]);
    expect(s.currentWord).toBe("");
    expect(s.playerTotalWins).toBe(0);
    expect(s.botTotalWins).toBe(0);
  });
});

describe("WordPoker scoreWord", () => {
  it("scores ACE correctly (A=2 C=4 E=2 => 8)", () => {
    expect(scoreWord("ACE")).toBe(8);
  });

  it("scores empty string as 0", () => {
    expect(scoreWord("")).toBe(0);
  });
});

describe("WordPoker isValidWord", () => {
  it("accepts known words", () => {
    expect(isValidWord("ACE")).toBe(true);
    expect(isValidWord("WATER")).toBe(true);
  });

  it("rejects unknown strings", () => {
    expect(isValidWord("ZZZZZ")).toBe(false);
    expect(isValidWord("XQZ")).toBe(false);
  });
});

describe("WordPoker botBestWord", () => {
  it("finds a valid word from a solvable hand", () => {
    const hand = [
      { id: 0, letter: "C", value: 4 },
      { id: 1, letter: "A", value: 2 },
      { id: 2, letter: "T", value: 3 },
      { id: 3, letter: "E", value: 2 },
      { id: 4, letter: "R", value: 3 },
      { id: 5, letter: "S", value: 3 },
      { id: 6, letter: "I", value: 2 },
    ];
    const { word } = botBestWord(hand);
    expect(word.length).toBeGreaterThanOrEqual(3);
    expect(isValidWord(word)).toBe(true);
  });

  it("returns empty string when no valid word possible", () => {
    const hand = [
      { id: 0, letter: "Z", value: 10 },
      { id: 1, letter: "Q", value: 10 },
      { id: 2, letter: "J", value: 10 },
    ];
    const { word, score } = botBestWord(hand);
    expect(word).toBe("");
    expect(score).toBe(0);
  });
});

describe("WordPoker reducer - card selection", () => {
  it("toggleCard selects a card", () => {
    const s = initialState(1, defaultSettings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggleCard", id });
    expect(s2.selectedIds).toContain(id);
    expect(s2.currentWord).toBe(s.hand[0]!.letter);
  });

  it("toggleCard deselects a selected card", () => {
    const s = initialState(1, defaultSettings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggleCard", id });
    const s3 = reducer(s2, { type: "toggleCard", id });
    expect(s3.selectedIds).not.toContain(id);
  });

  it("clearSelection resets", () => {
    const s = initialState(1, defaultSettings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggleCard", id });
    const s3 = reducer(s2, { type: "clearSelection" });
    expect(s3.selectedIds).toEqual([]);
    expect(s3.currentWord).toBe("");
  });
});

describe("WordPoker reducer - submit", () => {
  it("submit rejects word under 3 letters", () => {
    const s = initialState(1, defaultSettings);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type: "toggleCard", id });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.error).toBeTruthy();
    expect(s3.roundOver).toBe(false);
  });

  it("submit with valid word ends round", () => {
    const s = initialState(1, defaultSettings);
    // Build ACE manually
    const hand = [
      { id: 0, letter: "A", value: 2 },
      { id: 1, letter: "C", value: 4 },
      { id: 2, letter: "E", value: 2 },
      { id: 3, letter: "X", value: 10 },
      { id: 4, letter: "Q", value: 10 },
      { id: 5, letter: "Z", value: 10 },
      { id: 6, letter: "J", value: 10 },
    ];
    const s2 = { ...s, hand };
    const s3 = reducer(s2, { type: "toggleCard", id: 0 });
    const s4 = reducer(s3, { type: "toggleCard", id: 1 });
    const s5 = reducer(s4, { type: "toggleCard", id: 2 });
    const s6 = reducer(s5, { type: "submit" });
    expect(s6.roundOver).toBe(true);
    expect(s6.submittedWord).toBe("ACE");
    expect(s6.playerScore).toBe(8);
  });

  it("nextRound advances to next round", () => {
    const s = initialState(1, defaultSettings);
    const hand = [
      { id: 0, letter: "A", value: 2 },
      { id: 1, letter: "C", value: 4 },
      { id: 2, letter: "E", value: 2 },
      { id: 3, letter: "X", value: 10 },
      { id: 4, letter: "Q", value: 10 },
      { id: 5, letter: "Z", value: 10 },
      { id: 6, letter: "J", value: 10 },
    ];
    const s2 = { ...s, hand };
    const s3 = reducer(s2, { type: "toggleCard", id: 0 });
    const s4 = reducer(s3, { type: "toggleCard", id: 1 });
    const s5 = reducer(s4, { type: "toggleCard", id: 2 });
    const s6 = reducer(s5, { type: "submit" });
    const s7 = reducer(s6, { type: "nextRound" });
    expect(s7.round).toBe(2);
    expect(s7.roundOver).toBe(false);
    expect(s7.hand.length).toBe(7);
  });
});

describe("WordPoker isTerminal", () => {
  it("returns null while game is ongoing", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, playerTotalWins: 3 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(600);
  });
});
