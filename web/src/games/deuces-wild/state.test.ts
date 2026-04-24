import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateDeucesWild } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { handsPerSession: 25, bet: "10" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("DeucesWild evaluateDeucesWild", () => {
  it("detects Natural Royal Flush", () => {
    const hand = [c(1,"♠"), c(13,"♠"), c(12,"♠"), c(11,"♠"), c(10,"♠")];
    expect(evaluateDeucesWild(hand)).toBe("Natural Royal Flush");
  });

  it("detects Four Deuces", () => {
    const hand = [c(2,"♠"), c(2,"♥"), c(2,"♦"), c(2,"♣"), c(5,"♠")];
    expect(evaluateDeucesWild(hand)).toBe("Four Deuces");
  });

  it("detects Three of a Kind with one wild", () => {
    const hand = [c(2,"♠"), c(7,"♥"), c(7,"♦"), c(3,"♣"), c(9,"♠")];
    expect(evaluateDeucesWild(hand)).toBe("Three of a Kind");
  });

  it("detects Nothing for low non-qualifying hand", () => {
    const hand = [c(4,"♠"), c(6,"♥"), c(8,"♦"), c(9,"♣"), c(3,"♠")];
    expect(evaluateDeucesWild(hand)).toBe("Nothing");
  });
});

describe("DeucesWild initialState", () => {
  it("starts with bankroll 1000 and betting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("betting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("DeucesWild deal action", () => {
  it("deals 5 cards and enters draw phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("draw");
    expect(s2.hand.length).toBe(5);
    expect(s2.bankroll).toBe(990);
  });
});

describe("DeucesWild toggle-hold", () => {
  it("toggles held state", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "toggle-hold", index: 0 });
    expect(s3.held[0]).toBe(true);
    const s4 = reducer(s3, { type: "toggle-hold", index: 0 });
    expect(s4.held[0]).toBe(false);
  });
});

describe("DeucesWild draw action", () => {
  it("completes hand and enters settled phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "draw" });
    expect(s3.phase).toBe("settled");
    expect(s3.hand.length).toBe(5);
    expect(s3.handsPlayed).toBe(1);
    expect(s3.handRank).not.toBeNull();
  });
});

describe("DeucesWild isTerminal", () => {
  it("is terminal when hands played >= handsPerSession", () => {
    const s = initialState(42, defaultSettings);
    const exhausted = { ...s, phase: "settled" as const, handsPlayed: 25, bankroll: 500 };
    expect(isTerminal(exhausted)).not.toBeNull();
    expect(isTerminal(exhausted)?.score).toBe(500);
  });

  it("not terminal in early game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
