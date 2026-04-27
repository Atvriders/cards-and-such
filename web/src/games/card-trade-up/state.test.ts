import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TRADES } from "./state.js";
const S = { dummy: false };
describe("CardTradeUp", () => {
  it("starts in deciding with current and candidate", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("deciding");
    expect(s.trade).toBe(1);
  });
  it("trade keeps the candidate as current", () => {
    let s = initialState(1, S);
    const cand = s.candidate;
    s = reducer(s, { type: "trade" });
    expect(s.current).toBe(cand);
  });
  it("12 total trades", () => { expect(TOTAL_TRADES).toBe(12); });
  it("after 12 actions the game ends", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_TRADES; i++) s = reducer(s, { type: "keep" });
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
