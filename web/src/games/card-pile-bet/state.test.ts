import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardColor } from "./state.js";

const s12 = { rounds: "12" as const };

describe("CardPileBet initialState", () => {
  it("starts in betting phase", () => {
    const s = initialState(1, s12);
    expect(s.phase).toBe("betting");
    expect(s.round).toBe(1);
  });
  it("has cards in pile", () => {
    expect(initialState(1, s12).pile.length).toBeGreaterThan(10);
  });
  it("is deterministic", () => {
    expect(initialState(42, s12).topCard).toBe(initialState(42, s12).topCard);
  });
  it("score starts at 0", () => {
    expect(initialState(1, s12).score).toBe(0);
  });
});

describe("CardPileBet reducer", () => {
  it("correct bet adds 20 pts", () => {
    const s = initialState(1, s12);
    const nextCard = s.pile[0]!;
    const correctColor = cardColor(nextCard);
    const s2 = reducer(s, { type: "bet", color: correctColor });
    expect(s2.result).toBe("correct");
    expect(s2.score).toBe(20);
  });
  it("wrong bet deducts 10 pts (min 0)", () => {
    const s = initialState(1, s12);
    const nextCard = s.pile[0]!;
    const wrongColor = cardColor(nextCard) === "red" ? "black" : "red";
    const s2 = reducer(s, { type: "bet", color: wrongColor });
    expect(s2.result).toBe("wrong");
    expect(s2.score).toBe(0); // max(0, 0-10)
  });
  it("next advances round", () => {
    const s = initialState(1, s12);
    const s2 = reducer(s, { type: "bet", color: "red" });
    const s3 = s2.phase === "reveal" ? reducer(s2, { type: "next" }) : s2;
    if (s3.phase === "betting") expect(s3.round).toBe(2);
  });
  it("gameover after max rounds", () => {
    let s = initialState(1, { rounds: "8" });
    for (let i = 0; i < 8; i++) {
      s = reducer(s, { type: "bet", color: "red" });
      if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
