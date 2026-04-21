import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlay, playableCards } from "./state.js";
import type { Card } from "./state.js";

const defaultSettings = { opponents: "1" as const };

function card(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("deals all 52 cards", () => {
    const s = initialState(42, defaultSettings);
    const total = s.hands.reduce((sum, h) => sum + h.length, 0);
    expect(total).toBe(52);
  });

  it("the player holding 7♦ goes first", () => {
    const s = initialState(42, defaultSettings);
    const firstPlayer = s.turn;
    const hasSevenDiamonds = s.hands[firstPlayer]!.some((c) => c.suit === "♦" && c.rank === 7);
    expect(hasSevenDiamonds).toBe(true);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.hands[0]).toEqual(s2.hands[0]);
  });

  it("board starts empty", () => {
    const s = initialState(42, defaultSettings);
    const suits = ["♠", "♥", "♦", "♣"] as const;
    for (const suit of suits) {
      expect(s.board[suit].played).toBe(false);
    }
  });
});

describe("canPlay", () => {
  it("allows placing a 7 on empty board", () => {
    const { board } = initialState(42, defaultSettings);
    const sevenSpade = card("♠", 7);
    expect(canPlay(sevenSpade, board)).toBe(true);
  });

  it("disallows placing non-7 on empty row", () => {
    const { board } = initialState(42, defaultSettings);
    expect(canPlay(card("♠", 8), board)).toBe(false);
  });

  it("allows extending a played row upward", () => {
    const s = initialState(42, defaultSettings);
    const board = { ...s.board, "♠": { low: 7, high: 7, played: true } };
    expect(canPlay(card("♠", 8), board)).toBe(true);
    expect(canPlay(card("♠", 6), board)).toBe(true);
    expect(canPlay(card("♠", 9), board)).toBe(false);
  });
});

describe("reducer — play", () => {
  it("placing 7♦ starts the diamond row", () => {
    // Find a seed where player 0 has 7♦
    let s = initialState(42, defaultSettings);
    if (s.turn !== 0) {
      // Try another seed
      s = initialState(100, defaultSettings);
    }
    // Find player who has 7♦ and give them a turn
    let sevenDiamond: Card | undefined;
    let playerWithSeven = -1;
    for (let i = 0; i < s.numPlayers; i++) {
      sevenDiamond = s.hands[i]!.find((c) => c.suit === "♦" && c.rank === 7);
      if (sevenDiamond) { playerWithSeven = i; break; }
    }
    expect(sevenDiamond).toBeDefined();
    // We just verify the board logic: after placing 7♦ board has that row played
    const mockState = { ...s, turn: 0 as const, hands: s.hands.map((h, i) => i === 0 ? [sevenDiamond!, ...h.filter((c) => c.id !== sevenDiamond!.id)] : h) };
    // force player to have 7♦
    const withSeven = { ...mockState, hands: [[sevenDiamond!, ...s.hands[0]!.filter(c => c.id !== sevenDiamond!.id)], ...s.hands.slice(1)] };
    const s2 = reducer({ ...withSeven, turn: 0, board: { ...withSeven.board, "♦": { low: 0, high: 0, played: false } } }, { type: "play", card: sevenDiamond! });
    expect(s2.board["♦"].played).toBe(true);
  });

  it("does not allow playing an illegal card", () => {
    const s = initialState(42, defaultSettings);
    const illegalCard = card("♠", 8); // can't play 8♠ before 7♠
    const mockState = { ...s, turn: 0 as const, hands: [[illegalCard, ...s.hands[0]!], ...s.hands.slice(1)] };
    const s2 = reducer(mockState, { type: "play", card: illegalCard });
    expect(s2).toBe(mockState); // no-op
  });
});

describe("reducer — pass", () => {
  it("records a pass in lastAction when no playable cards", () => {
    const s = initialState(42, defaultSettings);
    // Make ALL hands unplayable — give everyone only a 2 so nobody can play on empty board
    const mockHands = s.hands.map(() => [card("♠", 2)]);
    const mockState = { ...s, turn: 0 as const, hands: mockHands };
    const s2 = reducer(mockState, { type: "pass" });
    // After everyone passes, deadlock detected — someone wins (passCount >= numPlayers)
    // OR at least a pass was recorded
    expect(s2.lastAction).toContain("passed");
  });
});

describe("isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when player wins", () => {
    const s = initialState(42, defaultSettings);
    const s2 = { ...s, winner: 0 as const };
    const t = isTerminal(s2);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(1000);
  });

  it("returns 0 score when bot wins", () => {
    const s = initialState(42, defaultSettings);
    const s2 = { ...s, winner: 1 as const };
    const t = isTerminal(s2);
    expect(t!.score).toBe(0);
  });
});

describe("playableCards", () => {
  it("returns empty when board empty and no 7s in hand", () => {
    const { board } = initialState(42, defaultSettings);
    const hand = [card("♠", 5), card("♥", 8)];
    expect(playableCards(hand, board)).toHaveLength(0);
  });

  it("returns 7s when board is empty and hand has 7", () => {
    const { board } = initialState(42, defaultSettings);
    const hand = [card("♠", 7), card("♥", 8)];
    const result = playableCards(hand, board);
    expect(result).toHaveLength(1);
    expect(result[0]!.rank).toBe(7);
  });
});
