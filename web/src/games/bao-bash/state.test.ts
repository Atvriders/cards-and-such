import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("BaoBash", () => {
  it("starts in playing with full timer", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.ticksRemaining).toBe(TIMER_TICKS); expect(s.targets).toEqual([]); });
  it("tick adds targets and decrements timer", () => { const s = reducer(initialState(1, S), { type:"tick" }); expect(s.ticksRemaining).toBe(TIMER_TICKS - 1); expect(s.targets.length).toBeGreaterThanOrEqual(1); });
  it("pop removes target and adds 10 points", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"tick" });
    const id = s.targets[0]!.id;
    s = reducer(s, { type:"pop", id });
    expect(s.score).toBe(10);
    expect(s.popped).toBe(1);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after timer ticks", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type:"tick" });
    expect(s.phase).toBe("done");
  });
});
