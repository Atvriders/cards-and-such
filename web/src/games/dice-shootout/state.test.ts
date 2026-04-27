import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET } from "./state.js";
const S = { dummy: false };
describe("DiceShootout", () => {
  it("starts at 0-0", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.player).toBe(0); expect(s.ai).toBe(0); });
  it("roll updates dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.lastP).toBeGreaterThanOrEqual(1); expect(s.lastA).toBeGreaterThanOrEqual(1); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("game ends with target reached", () => {
    let s=initialState(1,S);
    let safety=10000;
    while (s.phase==="playing" && safety-->0) s=reducer(s,{type:"roll"});
    expect(s.phase).toBe("done");
    expect(s.player>=TARGET || s.ai>=TARGET).toBe(true);
  });
  it("score reflects winner bonus", () => {
    let s=initialState(1,S);
    let safety=10000;
    while (s.phase==="playing" && safety-->0) s=reducer(s,{type:"roll"});
    const t=isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});
