import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateDoubleBonusHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { handsPerSession: 25, bet: "10" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("DoubleBonusPoker evaluateDoubleBonusHand", () => {
  it("detects Royal Flush", () => {
    expect(evaluateDoubleBonusHand([c(1,"♠"),c(13,"♠"),c(12,"♠"),c(11,"♠"),c(10,"♠")])).toBe("Royal Flush");
  });
  it("detects Four Aces", () => {
    expect(evaluateDoubleBonusHand([c(1,"♠"),c(1,"♥"),c(1,"♦"),c(1,"♣"),c(5,"♠")])).toBe("Four Aces");
  });
  it("detects Four 2s-4s", () => {
    expect(evaluateDoubleBonusHand([c(3,"♠"),c(3,"♥"),c(3,"♦"),c(3,"♣"),c(9,"♠")])).toBe("Four 2s-4s");
  });
  it("detects Jacks or Better pair", () => {
    expect(evaluateDoubleBonusHand([c(11,"♠"),c(11,"♥"),c(5,"♦"),c(7,"♣"),c(9,"♠")])).toBe("Jacks or Better");
  });
  it("detects Nothing for low pair", () => {
    expect(evaluateDoubleBonusHand([c(4,"♠"),c(4,"♥"),c(7,"♦"),c(9,"♣"),c(2,"♠")])).toBe("Nothing");
  });
});

describe("DoubleBonusPoker initialState", () => {
  it("starts with bankroll 1000", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
  });
});

describe("DoubleBonusPoker deal", () => {
  it("deals 5 cards", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("draw");
    expect(s2.hand.length).toBe(5);
    expect(s2.bankroll).toBe(990);
  });
});

describe("DoubleBonusPoker draw", () => {
  it("completes to settled", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "draw" });
    expect(s3.phase).toBe("settled");
    expect(s3.handRank).not.toBeNull();
    expect(s3.handsPlayed).toBe(1);
  });
});

describe("DoubleBonusPoker isTerminal", () => {
  it("terminal when session complete", () => {
    const s = initialState(42, defaultSettings);
    const end = { ...s, phase: "settled" as const, handsPlayed: 25, bankroll: 400 };
    expect(isTerminal(end)?.score).toBe(400);
  });
});
