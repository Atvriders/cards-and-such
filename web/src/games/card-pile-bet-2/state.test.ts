import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "8" as const };
describe("CardPileBet2", () => {
  it("initializes with coins and correct rounds", () => { const s = initialState(42, S); expect(s.coins).toBeGreaterThan(0); expect(s.maxRounds).toBe(8); expect(s.phase).toBe("betting"); });
  it("bet reveals card and changes coins", () => { const s = initialState(42, S); const s2 = reducer(s, { type:"bet", amount:5, dir:"higher" }); expect(s2.revealedCard).not.toBeNull(); expect(s2.phase).not.toBe("betting"); });
  it("next advances round", () => { let s = initialState(42, S); s = reducer(s, { type:"bet", amount:5, dir:"higher" }); if (s.phase === "revealed") { s = reducer(s, { type:"next" }); expect(s.round).toBe(2); } else { expect(s.phase).toBe("gameover"); } });
  it("isTerminal returns score when done", () => { const s = { ...initialState(42, S), phase:"gameover" as const }; expect(isTerminal(s)).not.toBeNull(); });
});
