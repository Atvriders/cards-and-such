import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questions: "10" as const };
describe("PrimeMinistersQuiz", () => {
  it("creates 10 questions", () => { expect(initialState(1,S).questions.length).toBe(10); });
  it("starts playing", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); });
  it("correct answer earns points", () => { const s=initialState(1,S); const c=s.questions[0]!.correct; const s2=reducer(reducer(s,{type:"select",choice:c}),{type:"submit"}); expect(s2.score).toBeGreaterThan(100); });
  it("terminal when done", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"select",choice:0});s=reducer(s,{type:"submit"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});
