import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { questionCount: "5" as const };
describe("ItalianCuisineQuiz", () => {
  it("creates correct number of entries", () => { const s = initialState(1, S); expect(s.entries.length).toBe(5); expect(s.score).toBe(0); expect(s.done).toBe(false); });
  it("each entry has 4 choices including the answer", () => { const s = initialState(2, S); for (const e of s.entries) { expect(e.choices.length).toBe(4); expect(e.choices).toContain(e.answer); } });
  it("correct selection adds 10 points", () => { const s = initialState(3, S); const e = s.entries[0]!; const idx = e.choices.indexOf(e.answer); const s2 = reducer(s, { type:"select", index:idx }); expect(s2.score).toBe(10); });
  it("completing all questions sets done", () => { let s = initialState(4, S); for (let i = 0; i < 5; i++) { s = reducer(s, { type:"select", index:0 }); s = reducer(s, { type:"next" }); } expect(s.done).toBe(true); expect(isTerminal(s)).not.toBeNull(); });
});
