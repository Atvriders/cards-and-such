import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WordChainState } from "./state.js";

const defSettings = { duration: "60" as const };

describe("WordChain initialState", () => {
  it("sets a startLetter and timeLeft", () => {
    const s = initialState(1, defSettings);
    expect(s.startLetter).toMatch(/^[A-Z]$/);
    expect(s.timeLeft).toBe(60);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.startLetter).toBe(s2.startLetter);
  });

  it("starts with empty chain", () => {
    const s = initialState(1, defSettings);
    expect(s.chain).toEqual([]);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });
});

describe("WordChain reducer", () => {
  function makeState(overrides: Partial<WordChainState> = {}): WordChainState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("type appends letter", () => {
    const s = makeState({ currentInput: "" });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.currentInput).toBe("A");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "CAT" });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("CA");
  });

  it("submit valid chain word adds to chain", () => {
    const s = makeState({
      startLetter: "B",
      chain: [],
      currentInput: "BACK",
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.chain).toContain("BACK");
    expect(s2.score).toBe(4); // length of BACK
  });

  it("submit rejects wrong starting letter", () => {
    const s = makeState({
      startLetter: "B",
      chain: [],
      currentInput: "CAKE",
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.chain).toHaveLength(0);
    expect(s2.message).toContain("Must start");
  });

  it("submit rejects duplicate word", () => {
    // Build a scenario: startLetter=A, chain=["ABLE","EARN","NEAR"]
    // Last letter of NEAR is R, so next must start with R
    // RACE is in word list; submit RACE, then the next letter is E
    // Then submit EARN (starts with E) — already in chain!
    const s = makeState({
      startLetter: "A",
      chain: ["ABLE", "EARN", "NEAR", "RACE"],
      currentInput: "EARN",  // starts with E (last letter of RACE), already in chain
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.chain).toHaveLength(4);
    expect(s2.message).toBe("Already used!");
  });

  it("chain links properly — next must start with last letter", () => {
    let s = makeState({ startLetter: "B", chain: [] });
    s = reducer({ ...s, currentInput: "BACK" }, { type: "submit" });
    expect(s.chain).toContain("BACK");
    // K is last letter, so next must start with K
    s = reducer({ ...s, currentInput: "KING" }, { type: "submit" });
    expect(s.chain).toContain("KING");
  });

  it("tick decrements timeLeft", () => {
    const s = makeState({ timeLeft: 10 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(9);
  });

  it("tick ends game at 0", () => {
    const s = makeState({ timeLeft: 1 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-ops after gameOver", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2).toBe(s);
  });
});

describe("WordChain isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 20 };
    expect(isTerminal(s)?.score).toBe(20);
  });
});
