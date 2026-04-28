import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET } from "./state.js";
const S = { dummy: false };
describe("DiceMountain", () => {
  it("starts at altitude 0", () => { const s = initialState(1, S); expect(s.altitude).toBe(0); expect(s.phase).toBe("roll"); });
  it("roll increases altitude", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.altitude).toBeGreaterThanOrEqual(2); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("eventually reaches target", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 200 && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type:"roll" });
      else if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.altitude).toBeGreaterThanOrEqual(TARGET);
  });
});
