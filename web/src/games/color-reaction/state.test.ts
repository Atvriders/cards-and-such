import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("ColorReaction", () => {
  it("starts playing with full timer", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.ticksRemaining).toBeGreaterThanOrEqual(TIMER_TICKS);
  });
  it("tick decrements timer", () => {
    const s = reducer(initialState(1, S), { type: "tick" });
    expect(s.ticksRemaining).toBeGreaterThanOrEqual(TIMER_TICKS - 1);
  });
  it("react on go state increments score", () => {
    let s = initialState(1, S);
    let attempts = 0;
    while (!s.isGo && attempts < 30) { s = reducer(s, { type: "tick" }); attempts++; }
    if (s.isGo) {
      const s2 = reducer(s, { type: "react" });
      expect(s2.score).toBeGreaterThanOrEqual(10);
    } else {
      expect(s.phase).toBe("done");
    }
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after timer expires", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TIMER_TICKS + 1; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
  });
});
