import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("RadishRush", () => {
  it("starts in playing with full timer", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.ticksRemaining).toBe(TIMER_TICKS); });
  it("tick spawns radishes", () => { const s = reducer(initialState(1, S), { type:"tick" }); expect(s.radishes.length).toBeGreaterThanOrEqual(1); });
  it("pop removes radish and adds 10 points", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"tick" });
    const id = s.radishes[0]!.id;
    s = reducer(s, { type:"pop", id });
    expect(s.score).toBe(10);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after timer expires", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type:"tick" });
    expect(s.phase).toBe("done");
  });
});
