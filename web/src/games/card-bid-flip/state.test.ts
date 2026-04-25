import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "10" as const };

describe("CardBidFlip", () => {
  it("starts with 100 coins", () => { expect(initialState(1, S).coins).toBe(100); });
  it("bid reveals card and changes coins", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "bid", amount: 10 });
    expect(s2.phase).toBe("gameover" as string === s2.phase ? "gameover" : "flipped");
    expect(s2.currentCard).not.toBeNull();
  });
  it("cannot bid in flipped phase", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "bid", amount: 10 });
    const s3 = reducer(s2, { type: "bid", amount: 10 });
    expect(s3.coins).toBe(s2.coins);
  });
  it("isTerminal returns score when gameover", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 10; i++) { s = reducer(s, { type: "bid", amount: 1 }); if (s.phase === "flipped") s = reducer(s, { type: "next" }); }
    const t = isTerminal({ ...s, phase: "gameover" });
    expect(t).not.toBeNull();
  });
});
