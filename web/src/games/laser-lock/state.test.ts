import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("LaserLock", () => {
  it("starts playing", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.ticksRemaining).toBe(TIMER_TICKS); });
  it("tick spawns targets", () => { const s = reducer(initialState(1, S), { type:"tick" }); expect(s.targets.length).toBeGreaterThanOrEqual(1); });
  it("hit awards score", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"tick" });
    const id = s.targets[0]!.id;
    s = reducer(s, { type:"hit", id });
    expect(s.score).toBeGreaterThanOrEqual(10);
    expect(s.hits).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TIMER_TICKS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type:"tick" });
    expect(s.phase).toBe("done");
  });
});
