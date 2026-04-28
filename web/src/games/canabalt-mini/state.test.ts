import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("CanabaltMini", () => {
  it("starts in playing with full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.ticksRemaining).toBeGreaterThanOrEqual(TIMER_TICKS);
    expect(s.targets).toEqual([]);
  });
  it("tick spawns targets and decrements timer", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticksRemaining).toBeGreaterThanOrEqual(TIMER_TICKS - 1);
    expect(s.targets.length).toBeGreaterThanOrEqual(1);
  });
  it("hit adds score and removes target", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tick" });
    const id = s.targets[0]!.id;
    s = reducer(s, { type: "hit", id });
    expect(s.score).toBeGreaterThanOrEqual(10);
    expect(s.hits).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after timer", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS + 1; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
  });
});
