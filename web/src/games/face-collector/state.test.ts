import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS, DRAWS_PER_ROUND } from "./state.js";
const S = { dummy: false };
describe("FaceCollector", () => {
  it("starts in drawing at round 0 with no draws", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.round).toBe(0); expect(s.draws.length).toBe(0); expect(s.targets.length).toBe(ROUNDS); });
  it("draw adds card to draws and tracks hit", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.draws.length).toBe(1); expect(s.hits.length).toBe(1); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("cannot draw past DRAWS_PER_ROUND", () => {
    let s = initialState(1, S);
    for (let i = 0; i < DRAWS_PER_ROUND + 2; i++) s = reducer(s, { type:"draw" });
    expect(s.draws.length).toBe(DRAWS_PER_ROUND);
  });
  it("next advances round after drawing all", () => {
    let s = initialState(1, S);
    for (let i = 0; i < DRAWS_PER_ROUND; i++) s = reducer(s, { type:"draw" });
    s = reducer(s, { type:"next" });
    if (ROUNDS > 1) { expect(s.round).toBe(1); expect(s.draws.length).toBe(0); }
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let r = 0; r < ROUNDS; r++) {
      for (let i = 0; i < DRAWS_PER_ROUND; i++) s = reducer(s, { type:"draw" });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
