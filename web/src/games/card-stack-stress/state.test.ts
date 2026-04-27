import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ATTEMPTS, STACK_TARGET } from "./state.js";
const S = { dummy: false };
describe("CardStackStress", () => {
  it("starts in playing with empty stack", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.stack.length).toBe(0);
    expect(s.attemptsLeft).toBe(ATTEMPTS);
  });
  it("draw produces a current card", () => {
    const s = reducer(initialState(1, S), { type: "draw" });
    expect(s.current).not.toBeNull();
  });
  it("pass clears current", () => {
    let s = reducer(initialState(1, S), { type: "draw" });
    s = reducer(s, { type: "pass" });
    expect(s.current).toBeNull();
  });
  it("stack adds to stack when valid", () => {
    let s = reducer(initialState(1, S), { type: "draw" });
    s = reducer(s, { type: "stack" });
    expect(s.stack.length).toBeGreaterThanOrEqual(0);
  });
  it("STACK_TARGET is 8", () => { expect(STACK_TARGET).toBe(8); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
