import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isValidMeld, classifyMeld, isSamba, isCanasta } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Samba - classifyMeld (sets)", () => {
  it("classifies 3 same-rank as set", () => {
    expect(classifyMeld([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")])).toBe("set");
  });
  it("returns null for fewer than 3", () => {
    expect(classifyMeld([c("♠", 7, "a"), c("♥", 7, "b")])).toBeNull();
  });
});

describe("Samba - classifyMeld (runs)", () => {
  it("classifies consecutive same-suit as run", () => {
    expect(classifyMeld([c("♠", 4, "a"), c("♠", 5, "b"), c("♠", 6, "c")])).toBe("run");
  });
  it("rejects run with mixed suits", () => {
    expect(classifyMeld([c("♠", 4, "a"), c("♥", 5, "b"), c("♠", 6, "c")])).toBeNull();
  });
  it("rejects non-consecutive run", () => {
    expect(classifyMeld([c("♠", 4, "a"), c("♠", 6, "b"), c("♠", 8, "c")])).toBeNull();
  });
});

describe("Samba - isSamba / isCanasta", () => {
  it("samba requires 7-card run", () => {
    const meld = {
      id: "x", owner: 0, meldType: "run" as const,
      cards: Array.from({ length: 7 }, (_, i) => c("♠", (4 + i) as Card["rank"], `c${i}`)),
    };
    expect(isSamba(meld)).toBe(true);
    expect(isCanasta(meld)).toBe(false);
  });
  it("canasta requires 7-card set", () => {
    const meld = {
      id: "x", owner: 0, meldType: "set" as const,
      cards: Array.from({ length: 7 }, (_, i) => c("♠", 7, `c${i}`)),
    };
    expect(isCanasta(meld)).toBe(true);
    expect(isSamba(meld)).toBe(false);
  });
});

describe("Samba - initialState", () => {
  it("deals 13 cards each", () => {
    const s = initialState(1, { botCount: 1 });
    expect(s.hands[0]!.length).toBe(13);
    expect(s.hands[1]!.length).toBe(13);
  });
  it("starts in player-draw", () => {
    expect(initialState(2, { botCount: 1 }).phase).toBe("player-draw");
  });
  it("isTerminal returns null initially", () => {
    expect(isTerminal(initialState(3, { botCount: 1 }))).toBeNull();
  });
  it("correct numPlayers for botCount 3", () => {
    expect(initialState(4, { botCount: 3 }).numPlayers).toBe(4);
  });
});
