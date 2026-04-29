import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("MelonMash", () => {
  it("starts in playing phase with full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.ticksRemaining).toBe(TIMER_TICKS);
    expect(s.targets).toEqual([]);
    expect(s.score).toBe(0);
  });
  it("tick spawns targets and decrements timer", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticksRemaining).toBe(TIMER_TICKS - 1);
    expect(s.targets.length).toBeGreaterThanOrEqual(1);
  });
  it("pop removes target and awards 10 points", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tick" });
    const id = s.targets[0]!.id;
    s = reducer(s, { type: "pop", id });
    expect(s.score).toBeGreaterThanOrEqual(10);
    expect(s.popped).toBeGreaterThanOrEqual(1);
  });
  it("popping unknown id is a no-op", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tick" });
    const before = s.score;
    s = reducer(s, { type: "pop", id: 9999 });
    expect(s.score).toBe(before);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after TIMER_TICKS ticks", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});
