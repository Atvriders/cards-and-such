import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("KebabStack", () => {
  it("initializes in aiming phase", () => { const s = initialState(42, S); expect(s.phase).toBe("aiming"); expect(s.score).toBe(0); });
  it("throw produces result phase", () => { const s = initialState(42, S); const s2 = reducer(s, { type:"setPower", value:50 }); const s3 = reducer(s2, { type:"throw" }); expect(["result","done"]).toContain(s3.phase); });
  it("next advances round", () => { let s = initialState(42, S); s = reducer(s, { type:"throw" }); if (s.phase === "result") { s = reducer(s, { type:"next" }); expect(s.roundIndex).toBe(1); } });
  it("isTerminal returns score when done", () => { const s = { ...initialState(42, S), phase:"done" as const }; expect(isTerminal(s)).not.toBeNull(); });
});
