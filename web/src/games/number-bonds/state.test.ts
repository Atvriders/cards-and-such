import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const t10 = { target: "10" as const, questions: "10" as const };
const t100 = { target: "100" as const, questions: "20" as const };

describe("NumberBonds initialState", () => {
  it("starts with zero score", () => {
    const s = initialState(1, t10);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates correct number of questions", () => {
    const s = initialState(1, t10);
    expect(s.questions.length).toBe(10);
  });

  it("same seed is deterministic", () => {
    const s1 = initialState(99, t10);
    const s2 = initialState(99, t10);
    expect(s1.questions[0]!.given).toBe(s2.questions[0]!.given);
  });

  it("given + answer equals target for every question", () => {
    const s = initialState(5, t100);
    for (const q of s.questions) {
      expect(q.given + q.answer).toBe(q.target);
    }
  });
});

describe("NumberBonds reducer", () => {
  it("type updates typed", () => {
    const s = initialState(1, t10);
    const s2 = reducer(s, { type: "type", text: "7" });
    expect(s2.typed).toBe("7");
  });

  it("correct answer scores 10", () => {
    const s = initialState(1, t10);
    const answer = s.questions[0]!.answer;
    const s2 = reducer(reducer(s, { type: "type", text: String(answer) }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer scores 0", () => {
    const s = initialState(1, t10);
    const wrong = s.questions[0]!.answer + 999;
    const s2 = reducer(reducer(s, { type: "type", text: String(wrong) }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("empty submit is no-op", () => {
    const s = initialState(1, t10);
    expect(reducer(s, { type: "submit" }).currentIndex).toBe(0);
  });
});

describe("NumberBonds isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, t10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, t10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.answer) });
      s = reducer(s, { type: "submit" });
    }
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBe(100);
  });
});
