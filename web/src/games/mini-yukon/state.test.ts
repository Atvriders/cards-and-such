import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, INITIAL_FLIP, MAX_CLICKS } from "./state.js";
const S = { dummy: false };
describe("MiniYukon", () => {
  it("starts in playing phase with layout filled", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.layout.length).toBeGreaterThanOrEqual(1);
    expect(s.layout.length).toBeLessThanOrEqual(INITIAL_FLIP);
  });
  it("remove action shrinks layout and adds score", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "remove", index: 0 });
    expect(s1.layout.length).toBe(s0.layout.length - 1);
    expect(s1.score).toBeGreaterThanOrEqual(15);
    expect(s1.removed).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after MAX_CLICKS or empty layout", () => {
    let s = initialState(1, S);
    let safety = 0;
    while (s.phase === "playing" && safety++ < MAX_CLICKS + 5) {
      s = reducer(s, { type: "remove", index: 0 });
    }
    expect(s.phase).toBe("done");
  });
});
