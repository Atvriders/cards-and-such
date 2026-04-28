import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("CardSpiral", () => {
  it("starts in playing with empty spiral", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.spiral.length).toBe(0);
    expect(s.drawn).toBeNull();
  });
  it("draw produces a card and increments drew", () => {
    const s = reducer(initialState(1, S), { type:"draw" });
    expect(s.drawn).not.toBeNull();
    expect(s.drew).toBe(1);
  });
  it("keep on first card always succeeds", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"draw" });
    s = reducer(s, { type:"keep" });
    expect(s.spiral.length).toBe(1);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("after TOTAL_DRAWS draws+resolves the game ends", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type:"draw" });
      s = reducer(s, { type:"discard" });
    }
    expect(s.phase).toBe("done");
  });
});
