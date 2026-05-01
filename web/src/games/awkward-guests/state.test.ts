import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, AwkwardGuests_CFG } from "./state.js";

const S = { dummy: false };

describe("awkward-guests", () => {
  it("starts in guess phase with empty history", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("guess");
    expect(s.guesses.length).toBe(0);
    expect(s.answer.length).toBe(AwkwardGuests_CFG.answerLength);
  });
  it("set updates working guess", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "set", position: 0, value: 1 });
    expect(s1.current[0]).toBe(1);
  });
  it("submit appends a guess with feedback", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "submit" });
    expect(s1.guesses.length).toBe(1);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("submitting the answer wins", () => {
    let s = initialState(1, S);
    for (let i = 0; i < AwkwardGuests_CFG.answerLength; i++) {
      s = reducer(s, { type: "set", position: i, value: s.answer[i]! });
    }
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("won");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("running out of guesses ends the puzzle", () => {
    let s = initialState(1, S);
    for (let i = 0; i < AwkwardGuests_CFG.maxGuesses; i++) {
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase === "won" || s.phase === "lost").toBe(true);
  });
});
