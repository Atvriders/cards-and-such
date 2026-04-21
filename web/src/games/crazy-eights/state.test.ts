import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  cardPenalty,
  type CrazyEightsState,
} from "./state.js";
import type { Card } from "../../engines/deck/index.js";

// Helper to build a minimal state for tests
function makeState(overrides: Partial<CrazyEightsState> = {}): CrazyEightsState {
  const base = initialState(42, { opponents: "2", forcePlayAfterDraw: true });
  return { ...base, ...overrides };
}

function makeCard(suit: "♠" | "♥" | "♦" | "♣", rank: number, id?: string): Card {
  return { suit, rank: rank as Card["rank"], id: id ?? `${suit}${rank}` };
}

describe("crazy-eights", () => {
  // Test 1: Initial state — hand sizes correct
  it("deals 7 cards to each player", () => {
    const s = initialState(42, { opponents: "2", forcePlayAfterDraw: true });
    expect(s.seats).toBe(3);
    expect(s.hands).toHaveLength(3);
    s.hands.forEach((h) => expect(h).toHaveLength(7));
  });

  // Test 2: Top of discard is not an 8
  it("discard top is never an 8", () => {
    for (const seed of [1, 2, 3, 42, 99, 1000]) {
      const s = initialState(seed, { opponents: "2", forcePlayAfterDraw: true });
      expect(s.discardTop.rank).not.toBe(8);
    }
  });

  // Test 3: activeSuit matches discard suit
  it("activeSuit equals discard top suit initially", () => {
    const s = initialState(42, { opponents: "2", forcePlayAfterDraw: true });
    expect(s.activeSuit).toBe(s.discardTop.suit);
  });

  // Test 4: Deterministic under same seed
  it("is deterministic under the same seed", () => {
    const a = initialState(7, { opponents: "2", forcePlayAfterDraw: true });
    const b = initialState(7, { opponents: "2", forcePlayAfterDraw: true });
    expect(a.hands[0]!.map((c) => c.id)).toEqual(b.hands[0]!.map((c) => c.id));
    expect(a.discardTop.id).toBe(b.discardTop.id);
  });

  // Test 5: Play a card matching suit
  it("accepts a card matching the active suit", () => {
    const top = makeCard("♥", 5, "top");
    const matchingSuit = makeCard("♥", 7, "ms");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[matchingSuit], [], []],
    });
    const next = reducer(s, { type: "play", cardId: "ms" });
    expect(next.discardTop.id).toBe("ms");
  });

  // Test 6: Play a card matching rank
  it("accepts a card matching the rank", () => {
    const top = makeCard("♥", 5, "top");
    const matchingRank = makeCard("♠", 5, "mr");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[matchingRank], [], []],
    });
    const next = reducer(s, { type: "play", cardId: "mr" });
    expect(next.discardTop.id).toBe("mr");
  });

  // Test 7: Play an 8 with chosenSuit → activeSuit updates
  it("playing an 8 with chosenSuit updates activeSuit", () => {
    const top = makeCard("♥", 5, "top");
    const eight = makeCard("♦", 8, "e8");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[eight], [], []],
      winner: null,
    });
    const next = reducer(s, { type: "play", cardId: "e8", chosenSuit: "♣" });
    expect(next.activeSuit).toBe("♣");
    expect(next.discardTop.id).toBe("e8");
  });

  // Test 8: Play an 8 without chosenSuit → reject
  it("rejects playing an 8 without chosenSuit", () => {
    const top = makeCard("♥", 5, "top");
    const eight = makeCard("♦", 8, "e8");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[eight], [], []],
    });
    const next = reducer(s, { type: "play", cardId: "e8" });
    expect(next).toBe(s); // no-op
  });

  // Test 9: Play an illegal card → reject
  it("rejects a card that matches neither suit nor rank", () => {
    const top = makeCard("♥", 5, "top");
    const illegal = makeCard("♠", 7, "il");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[illegal], [], []],
    });
    const next = reducer(s, { type: "play", cardId: "il" });
    expect(next).toBe(s);
  });

  // Test 10: Draw a card → hand size +1
  it("draw adds one card to human hand", () => {
    const top = makeCard("♥", 5, "top");
    // Drawn card matches suit, so with forcePlayAfterDraw=false it becomes playable → pendingDraw=true
    const drawnCard = makeCard("♥", 9, "h9"); // matches ♥
    const stock = [drawnCard, makeCard("♦", 3, "d3")];
    const handCard = makeCard("♠", 7, "s7"); // doesn't match ♥5
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[handCard], [makeCard("♦", 2, "d2")], [makeCard("♦", 3, "d33")]],
      stock,
      settings: { opponents: "2", forcePlayAfterDraw: false },
    });
    const initialHandSize = s.hands[0]!.length;
    const next = reducer(s, { type: "draw" });
    expect(next.hands[0]!.length).toBe(initialHandSize + 1);
    expect(next.pendingDraw).toBe(true);
  });

  // Test 11: Win condition — playing last card sets winner
  it("sets winner=0 and computes finalPenalties when human empties hand", () => {
    const top = makeCard("♥", 5, "top");
    const myCard = makeCard("♥", 3, "h3");
    const botCard = makeCard("♣", 7, "c7");
    const s = makeState({
      discardTop: top,
      activeSuit: "♥",
      turn: 0,
      hands: [[myCard], [botCard], []],
      stock: [],
      winner: null,
      finalPenalties: null,
    });
    const next = reducer(s, { type: "play", cardId: "h3" });
    expect(next.winner).toBe(0);
    expect(next.finalPenalties).not.toBeNull();
    expect(next.finalPenalties![0]).toBe(0);
    expect(next.finalPenalties![1]).toBe(7); // 7 of clubs
  });

  // Test 12: Penalty calculation
  it("cardPenalty: 8=50, J/Q/K=10, A=1, others=face value", () => {
    expect(cardPenalty(makeCard("♠", 8))).toBe(50);
    expect(cardPenalty(makeCard("♠", 11))).toBe(10); // J
    expect(cardPenalty(makeCard("♠", 12))).toBe(10); // Q
    expect(cardPenalty(makeCard("♠", 13))).toBe(10); // K
    expect(cardPenalty(makeCard("♠", 1))).toBe(1);   // A
    expect(cardPenalty(makeCard("♠", 7))).toBe(7);
    expect(cardPenalty(makeCard("♠", 2))).toBe(2);
  });

  // Test 13: isTerminal returns score when winner=0
  it("isTerminal returns score=200 when human wins", () => {
    const s = makeState({ winner: 0, finalPenalties: [0, 15, 20] });
    const result = isTerminal(s);
    expect(result).toEqual({ score: 200 });
  });

  // Test 14: isTerminal returns score based on penalty when bot wins
  it("isTerminal returns 200-penalty when bot wins", () => {
    const s = makeState({ winner: 1, finalPenalties: [30, 0, 50] });
    const result = isTerminal(s);
    expect(result).toEqual({ score: 170 }); // 200 - 30
  });

  // Test 15: isTerminal returns null when game not over
  it("isTerminal returns null when no winner", () => {
    const s = makeState({ winner: null, finalPenalties: null });
    expect(isTerminal(s)).toBeNull();
  });
});
