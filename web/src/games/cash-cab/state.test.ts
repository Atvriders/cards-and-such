import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S10 = { questions: "10" as const };

describe("cash-cab state", () => {
  it("starts in intro phase with 0 cash and correct number of questions", () => {
    const s = initialState(1, S10);
    expect(s.phase).toBe("intro");
    expect(s.cash).toBe(0);
    expect(s.questions.length).toBe(10);
  });

  it("starts with $50 after 'start' action", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "start" });
    expect(s.phase).toBe("playing");
    expect(s.cash).toBe(50);
  });

  it("doubles cash on correct answer and moves to answered phase", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice });
    expect(s.phase).toBe("answered");
    expect(s.lastCorrect).toBe(true);
    expect(s.cash).toBe(100); // 50 * 2
  });

  it("deducts $50 on wrong answer", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    const wrongChoice = ((correctChoice + 1) % 4) as 0 | 1 | 2 | 3;
    s = reducer(s, { type: "answer", choice: wrongChoice });
    expect(s.lastCorrect).toBe(false);
    expect(s.cash).toBe(0); // 50 - 50 = 0
  });

  it("stop_and_keep ends game with current cash", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice }); // cash = 100, phase = answered
    s = reducer(s, { type: "stop_and_keep" });
    expect(s.phase).toBe("stopped");
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(100);
  });

  it("continue_ride advances to next question", () => {
    let s = initialState(1, S10);
    s = reducer(s, { type: "start" });
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice });
    s = reducer(s, { type: "continue_ride" });
    expect(s.questionIndex).toBe(1);
    expect(s.phase).toBe("playing");
    expect(s.cash).toBe(100);
  });

  it("isTerminal returns null during play and score after done", () => {
    let s = initialState(1, S10);
    expect(isTerminal(s)).toBeNull();
    s = reducer(s, { type: "start" });
    expect(isTerminal(s)).toBeNull();
    // Answer all questions
    for (let i = 0; i < 10; i++) {
      const correct = s.questions[i]!.correct;
      s = reducer(s, { type: "answer", choice: correct });
      if (i < 9) s = reducer(s, { type: "continue_ride" });
    }
    s = reducer(s, { type: "continue_ride" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
