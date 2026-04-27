import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS, POINTS_PER_HIT } from "./state.js";
const S = { dummy: false };
describe("CrabCatch", () => {
  it("starts in playing with full timer and no critters", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.ticksRemaining).toBe(TIMER_TICKS); expect(s.critters).toEqual([]); });
  it("tick adds critters and decrements timer", () => { const s = reducer(initialState(1, S), { type:"tick" }); expect(s.ticksRemaining).toBe(TIMER_TICKS - 1); expect(s.critters.length).toBeGreaterThanOrEqual(1); });
  it("pop removes critter and adds POINTS_PER_HIT", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"tick" });
    const id = s.critters[0]!.id;
    s = reducer(s, { type:"pop", id });
    expect(s.score).toBe(POINTS_PER_HIT);
    expect(s.popped).toBe(1);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TIMER_TICKS ticks", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type:"tick" });
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
