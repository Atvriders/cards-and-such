import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pipValue, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardDiscardDown", () => {
  it("starts in selecting with 5-card hand", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("selecting");
    expect(s.hand.length).toBe(5);
  });
  it("pipValue: 2=2, 10=10, J/Q/K=10, A=1", () => {
    expect(pipValue(0)).toBe(2);
    expect(pipValue(8)).toBe(10);
    expect(pipValue(9)).toBe(10);  // J
    expect(pipValue(11)).toBe(10); // K
    expect(pipValue(12)).toBe(1);  // A
  });
  it("toggle adds and removes selection", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggle", index: 0 });
    expect(s.selected).toContain(0);
    s = reducer(s, { type: "toggle", index: 0 });
    expect(s.selected).not.toContain(0);
  });
  it("discard moves to result phase", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggle", index: 0 });
    s = reducer(s, { type: "discard" });
    expect(s.phase).toBe("result");
  });
  it("TOTAL_ROUNDS is 10", () => { expect(TOTAL_ROUNDS).toBe(10); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
