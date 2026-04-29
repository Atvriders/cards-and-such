import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS } from "./state.js";
const S = { dummy: false };
describe("Skittles (West Country)", () => {
  it("initial state", () => { const s=initialState(1,S); expect(s.turn).toBe(1); expect(s.myScore).toBe(0); expect(s.phase).toBe("ready"); });
  it("throw advances", () => { const s=reducer(initialState(1,S), { type:"throw" }); expect(["thrown","done"]).toContain(s.phase); expect(s.myScore).toBeGreaterThanOrEqual(0); expect(s.cpuScore).toBeGreaterThanOrEqual(0); });
  it("next advances turn", () => { let s=reducer(initialState(2,S), { type:"throw" }); if (s.phase === "thrown") { s=reducer(s, { type:"next" }); expect(s.turn).toBeGreaterThanOrEqual(2); } });
  it("multi-round play completes", () => { let s=initialState(7,S); for (let i=0;i<TOTAL_TURNS;i++) { s=reducer(s, { type:"throw" }); if (s.phase === "thrown") s=reducer(s, { type:"next" }); } expect(s.phase).toBe("done"); expect(isTerminal(s)).not.toBeNull(); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
