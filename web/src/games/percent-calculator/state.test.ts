import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const sEasy20 = { rounds: "20" as const, difficulty: "easy" as const };
const sHard30 = { rounds: "30" as const, difficulty: "hard" as const };

describe("PercentCalculator initialState", () => {
  it("generates correct number of questions", () => {
    const s = initialState(1, sEasy20);
    expect(s.questions.length).toBe(20);
  });

  it("starts at 90 seconds with score 0", () => {
    const s = initialState(1, sEasy20);
    expect(s.timeLeft).toBe(90);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("same seed gives same questions", () => {
    const s1 = initialState(42, sEasy20);
    const s2 = initialState(42, sEasy20);
    expect(s1.questions[0]!.answer).toBe(s2.questions[0]!.answer);
    expect(s1.questions[0]!.display).toBe(s2.questions[0]!.display);
  });

  it("hard difficulty generates 30 questions", () => {
    const s = initialState(7, sHard30);
    expect(s.questions.length).toBe(30);
  });
});

describe("PercentCalculator reducer", () => {
  it("tick reduces timeLeft", () => {
    const s = initialState(1, sEasy20);
    const s2 = reducer(s, { type: "tick", dt: 5 });
    expect(s2.timeLeft).toBeCloseTo(85);
  });

  it("tick to 0 ends game", () => {
    const s = initialState(1, sEasy20);
    const s2 = reducer(s, { type: "tick", dt: 90 });
    expect(s2.phase).toBe("done");
  });

  it("correct answer within tolerance scores 10", () => {
    const s = initialState(1, sEasy20);
    const q = s.questions[0]!;
    const s2 = reducer(reducer(s, { type: "type", text: String(q.answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer scores 0 but advances", () => {
    const s = initialState(1, sEasy20);
    const s2 = reducer(reducer(s, { type: "type", text: "9999" }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.currentIndex).toBe(1);
  });

  it("empty submit is no-op", () => {
    const s = initialState(1, sEasy20);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.currentIndex).toBe(0);
  });

  it("no tick after done", () => {
    const s = initialState(1, sEasy20);
    const ended = reducer(s, { type: "tick", dt: 100 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.timeLeft).toBe(0);
  });
});

describe("PercentCalculator isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, sEasy20))).toBeNull();
  });

  it("returns score when time expires", () => {
    const s = initialState(1, sEasy20);
    const ended = reducer(s, { type: "tick", dt: 90 });
    const r = isTerminal(ended);
    expect(r).not.toBeNull();
    expect(typeof r!.score).toBe("number");
  });
});
