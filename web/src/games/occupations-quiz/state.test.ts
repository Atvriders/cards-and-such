import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { questions: "10" as const };

describe("OccupationsQuiz initialState", () => {
  it("creates correct number of questions", () => {
    expect(initialState(1, def).questions.length).toBe(10);
  });

  it("starts in playing phase", () => {
    const s = initialState(1, def);
    expect(s.phase).toBe("playing");
    expect(s.timeLeft).toBe(15);
  });

  it("is deterministic", () => {
    expect(initialState(9, def).questions[0]!.question).toBe(initialState(9, def).questions[0]!.question);
  });

  it("each question has 4 choices", () => {
    for (const q of initialState(1, def).questions) expect(q.choices.length).toBe(4);
  });
});

describe("OccupationsQuiz reducer", () => {
  it("select stores choice", () => {
    expect(reducer(initialState(1, def), { type: "select", choice: 3 }).selected).toBe(3);
  });

  it("correct submit awards points", () => {
    const s = initialState(1, def);
    const correct = s.questions[0]!.correct;
    const s2 = reducer(reducer(s, { type: "select", choice: correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.correctCount).toBe(1);
  });

  it("tick decrements timer", () => {
    expect(reducer(initialState(1, def), { type: "tick" }).timeLeft).toBe(14);
  });

  it("next advances to next question", () => {
    const s = initialState(1, def);
    const s2 = reducer(reducer(reducer(s, { type: "select", choice: 0 }), { type: "submit" }), { type: "next" });
    expect(s2.currentIndex).toBe(1);
  });
});

describe("OccupationsQuiz isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "select", choice: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
