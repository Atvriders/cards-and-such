import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MonikersQuiz", () => {
  it("creates 10 questions", () => { expect(initialState(1, S).questions.length).toBeGreaterThanOrEqual(10); });
  it("starts in playing phase", () => { expect(initialState(1, S).phase).toBe("playing"); });
  it("submit on correct awards score", () => {
    const s = initialState(1, S);
    const s2 = reducer(reducer(s, { type:"select", choice: s.questions[0]!.correct }), { type:"submit" });
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("submit on wrong scores zero", () => {
    const s = initialState(1, S);
    const wrong = (s.questions[0]!.correct + 1) % 4;
    const s2 = reducer(reducer(s, { type:"select", choice: wrong }), { type:"submit" });
    expect(s2.correctCount).toBe(0);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("can finish full game", () => {
    let s = initialState(1, S);
    for (let i = 0; i < s.questions.length; i++) {
      s = reducer(s, { type:"select", choice: 0 });
      s = reducer(s, { type:"submit" });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
