import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_PUZZLES, MAGIC_SUM } from "./state.js";
const S = { dummy: false };
describe("Gridmagic", () => {
  it("starts in playing with 6 puzzles", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.puzzles.length).toBe(TOTAL_PUZZLES);
  });
  it("each puzzle's full square has correct row sums", () => {
    const s = initialState(1, S);
    for (const p of s.puzzles) {
      const r0 = (p.square[0] ?? 0) + (p.square[1] ?? 0) + (p.square[2] ?? 0);
      const r1 = (p.square[3] ?? 0) + (p.square[4] ?? 0) + (p.square[5] ?? 0);
      const r2 = (p.square[6] ?? 0) + (p.square[7] ?? 0) + (p.square[8] ?? 0);
      expect(r0).toBe(MAGIC_SUM);
      expect(r1).toBe(MAGIC_SUM);
      expect(r2).toBe(MAGIC_SUM);
    }
  });
  it("correct fills score 30", () => {
    const s = initialState(1, S);
    const p = s.puzzles[0]!;
    let s2 = reducer(s, { type: "selectBlank", which: 0 });
    s2 = reducer(s2, { type: "pick", value: p.square[p.blanks[0]]! });
    s2 = reducer(s2, { type: "selectBlank", which: 1 });
    s2 = reducer(s2, { type: "pick", value: p.square[p.blanks[1]]! });
    s2 = reducer(s2, { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(30);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
