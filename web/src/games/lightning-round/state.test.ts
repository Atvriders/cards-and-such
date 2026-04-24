import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S60 = { timeLimit: "60" as const };

describe("lightning-round state", () => {
  it("starts in countdown phase with 30 questions and correct time", () => {
    const s = initialState(1, S60);
    expect(s.phase).toBe("countdown");
    expect(s.questions.length).toBe(30);
    expect(s.timeLeft).toBe(60);
    expect(s.score).toBe(0);
  });

  it("transitions to playing on start action", () => {
    let s = initialState(1, S60);
    s = reducer(s, { type: "start" });
    expect(s.phase).toBe("playing");
  });

  it("awards 1 point for correct answer and advances question", () => {
    let s = initialState(1, S60);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice });
    expect(s.score).toBe(1);
    expect(s.questionIndex).toBe(1);
    expect(s.lastCorrect).toBe(true);
  });

  it("awards 0 points for wrong answer and still advances", () => {
    let s = initialState(1, S60);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    const wrongChoice = ((correctChoice + 1) % 4) as 0 | 1 | 2 | 3;
    s = reducer(s, { type: "answer", choice: wrongChoice });
    expect(s.score).toBe(0);
    expect(s.questionIndex).toBe(1);
    expect(s.lastCorrect).toBe(false);
  });

  it("ends game when time runs out via ticks", () => {
    let s = initialState(1, S60);
    s = reducer(s, { type: "start" });
    // Tick 60 times
    for (let i = 0; i < 60; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null during gameplay", () => {
    let s = initialState(1, S60);
    expect(isTerminal(s)).toBeNull();
    s = reducer(s, { type: "start" });
    expect(isTerminal(s)).toBeNull();
  });
});
