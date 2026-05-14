import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  WORD_BANK,
  BOARD_SIZE,
  TURN_SECONDS,
  SQUARES_PER_CATEGORY,
} from "./state.js";
import type { PictionaryState, PictionaryAction } from "./state.js";

const S = { _dummy: false };

describe("pictionary-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a).toEqual(b);
    const c = initialState(456, S);
    // Different seed should still produce a valid baseline state
    expect(c.phase).toBe("setup");
  });

  it("starts in setup phase with both teams at 0 and full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("setup");
    expect(s.teamPositions).toEqual([0, 0]);
    expect(s.currentTeam).toBe(0);
    expect(s.timeLeft).toBe(TURN_SECONDS);
    expect(s.currentWordIdx).toBe(-1);
    expect(s.winner).toBeNull();
  });

  it("word bank has 50+ entries across 5 categories", () => {
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(50);
    const categories = new Set(WORD_BANK.map((w) => w.category));
    expect(categories.size).toBe(5);
    for (const c of ["person", "object", "action", "animal", "difficult"]) {
      expect(categories.has(c as never)).toBe(true);
    }
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("start action transitions setup -> drawing and picks a word", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "start" } as PictionaryAction);
    expect(s1.phase).toBe("drawing");
    expect(s1.currentWordIdx).toBeGreaterThanOrEqual(0);
    expect(s1.currentWordIdx).toBeLessThan(WORD_BANK.length);
    expect(s1.usedWords).toHaveLength(1);
  });

  it("tick decrements timeLeft and triggers turnover at 0", () => {
    let s = reducer(initialState(1, S), { type: "start" } as PictionaryAction);
    expect(s.timeLeft).toBe(TURN_SECONDS);
    s = reducer(s, { type: "tick" } as PictionaryAction);
    expect(s.timeLeft).toBe(TURN_SECONDS - 1);
    // fast-forward to 1 tick remaining
    for (let i = 0; i < TURN_SECONDS - 2; i++) {
      s = reducer(s, { type: "tick" } as PictionaryAction);
    }
    expect(s.timeLeft).toBe(1);
    expect(s.phase).toBe("drawing");
    s = reducer(s, { type: "tick" } as PictionaryAction);
    expect(s.timeLeft).toBe(0);
    expect(s.phase).toBe("turnover");
  });

  it("correct action advances the team by the category's square count and picks a new word", () => {
    let s = reducer(initialState(1, S), { type: "start" } as PictionaryAction);
    const wordIdx = s.currentWordIdx;
    const cat = WORD_BANK[wordIdx]!.category;
    const expectedAdvance = SQUARES_PER_CATEGORY[cat];
    s = reducer(s, { type: "correct" } as PictionaryAction);
    expect(s.teamPositions[0]).toBe(expectedAdvance);
    expect(s.totalCorrect[0]).toBe(1);
    expect(s.turnAdvance).toBe(expectedAdvance);
    // A fresh word was drawn (phase stays drawing)
    expect(s.phase).toBe("drawing");
    expect(s.currentWordIdx).toBeGreaterThanOrEqual(0);
  });

  it("skip action draws a new word without advancing", () => {
    let s = reducer(initialState(1, S), { type: "start" } as PictionaryAction);
    const wordIdxBefore = s.currentWordIdx;
    const posBefore = s.teamPositions[0];
    s = reducer(s, { type: "skip" } as PictionaryAction);
    expect(s.teamPositions[0]).toBe(posBefore);
    expect(s.turnSkips).toBe(1);
    expect(s.phase).toBe("drawing");
    // word should have changed (or at least an attempt was logged in usedWords)
    expect(s.usedWords.length).toBeGreaterThanOrEqual(2);
    void wordIdxBefore;
  });

  it("nextTurn switches to the other team and resets turn counters", () => {
    let s = reducer(initialState(1, S), { type: "start" } as PictionaryAction);
    // fast-forward to turnover by timing out
    s = reducer(s, { type: "timeout" } as PictionaryAction);
    expect(s.phase).toBe("turnover");
    s = reducer(s, { type: "nextTurn" } as PictionaryAction);
    expect(s.currentTeam).toBe(1);
    expect(s.phase).toBe("setup");
    expect(s.timeLeft).toBe(TURN_SECONDS);
    expect(s.turnAdvance).toBe(0);
    expect(s.turnSkips).toBe(0);
  });

  it("illegal actions return the same state reference", () => {
    const s0 = initialState(1, S);
    // cannot tick during setup
    expect(reducer(s0, { type: "tick" } as PictionaryAction)).toBe(s0);
    // cannot mark correct during setup
    expect(reducer(s0, { type: "correct" } as PictionaryAction)).toBe(s0);
    // cannot skip during setup
    expect(reducer(s0, { type: "skip" } as PictionaryAction)).toBe(s0);
    // cannot start while already drawing
    const s1 = reducer(s0, { type: "start" } as PictionaryAction);
    expect(reducer(s1, { type: "start" } as PictionaryAction)).toBe(s1);
  });

  it("game ends with isTerminal returning a positive score when a team reaches the finish", () => {
    let s: PictionaryState = initialState(1, S);
    s = reducer(s, { type: "start" } as PictionaryAction);
    // Simulate enough correct guesses to cross the finish for team 0.
    // Worst-case 3 squares per correct -> ~17 correct calls definitely wins.
    for (let i = 0; i < 50 && s.phase === "drawing"; i++) {
      s = reducer(s, { type: "correct" } as PictionaryAction);
    }
    expect(s.phase).toBe("done");
    expect(s.winner).toBe(0);
    expect(s.teamPositions[0]).toBeGreaterThanOrEqual(BOARD_SIZE);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });

  it("done state ignores further actions", () => {
    let s: PictionaryState = initialState(1, S);
    s = reducer(s, { type: "start" } as PictionaryAction);
    for (let i = 0; i < 50 && s.phase === "drawing"; i++) {
      s = reducer(s, { type: "correct" } as PictionaryAction);
    }
    expect(s.phase).toBe("done");
    const same = reducer(s, { type: "correct" } as PictionaryAction);
    expect(same).toBe(s);
    const same2 = reducer(s, { type: "nextTurn" } as PictionaryAction);
    expect(same2).toBe(s);
  });
});
