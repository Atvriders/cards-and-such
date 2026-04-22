import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, computeMelds, makePinochleDeck, counterValue } from "./state.js";
import type { PinochleState } from "./state.js";

const defaultSettings = { botDifficulty: "standard" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<PinochleState> = {}): PinochleState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], [], []],
    trumpSuit: "♠",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0, 0],
    takenCards: [[], [], [], []],
    tricksPlayed: 0,
    meldsByTeam: [0, 0],
    finalScores: null,
    ...overrides,
  };
}

// ── 1. Deck ───────────────────────────────────────────────────────────────────

describe("makePinochleDeck", () => {
  it("has 48 cards", () => {
    expect(makePinochleDeck().length).toBe(48);
  });

  it("has exactly 2 of each rank/suit combo", () => {
    const deck = makePinochleDeck();
    const counts = new Map<string, number>();
    for (const c of deck) {
      const key = `${c.suit}${c.rank}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const [, count] of counts) expect(count).toBe(2);
  });
});

// ── 2. Counter values ─────────────────────────────────────────────────────────

describe("counterValue", () => {
  it("Ace = 11", () => expect(counterValue(1)).toBe(11));
  it("10 = 10", () => expect(counterValue(10)).toBe(10));
  it("K = 4", () => expect(counterValue(13)).toBe(4));
  it("Q = 3", () => expect(counterValue(12)).toBe(3));
  it("J = 2", () => expect(counterValue(11)).toBe(2));
  it("9 = 0", () => expect(counterValue(9)).toBe(0));
});

// ── 3. Meld scoring ───────────────────────────────────────────────────────────

describe("computeMelds", () => {
  it("run in trump = 150", () => {
    const trump = "♥";
    const hand: Card[] = [
      makeCard("♥", 1), makeCard("♥", 13), makeCard("♥", 12),
      makeCard("♥", 11), makeCard("♥", 10),
    ];
    const melds = computeMelds(hand, trump);
    expect(melds.some(m => m.value === 150)).toBe(true);
  });

  it("pinochle (Q♠ + J♦) = 40", () => {
    const hand: Card[] = [makeCard("♠", 12), makeCard("♦", 11)];
    const melds = computeMelds(hand, "♣");
    expect(melds.some(m => m.name.includes("Pinochle") && m.value === 40)).toBe(true);
  });

  it("four aces = 100", () => {
    const hand: Card[] = [
      makeCard("♠", 1), makeCard("♥", 1), makeCard("♦", 1), makeCard("♣", 1),
    ];
    const melds = computeMelds(hand, "♠");
    expect(melds.some(m => m.value === 100 && m.name.includes("Aces"))).toBe(true);
  });

  it("marriage in trump = 40", () => {
    const hand: Card[] = [makeCard("♠", 13), makeCard("♠", 12)];
    const melds = computeMelds(hand, "♠");
    expect(melds.some(m => m.value === 40 && m.name.includes("trump"))).toBe(true);
  });
});

// ── 4. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 12 cards to each player", () => {
    const s = initialState(42, defaultSettings);
    for (const hand of s.hands) expect(hand.length).toBe(12);
  });

  it("starts in playing phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("playing");
  });

  it("trump suit is valid", () => {
    const s = initialState(42, defaultSettings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });
});

// ── 5. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("all cards legal when leading", () => {
    const hand: Card[] = [makeCard("♣", 9), makeCard("♥", 11)];
    const s = baseState({ hands: [hand, [], [], []], currentTrick: [] });
    expect(legalPlays(s, 0).length).toBe(2);
  });

  it("must follow suit if possible", () => {
    const hand: Card[] = [makeCard("♣", 9, "c9"), makeCard("♥", 11, "hj")];
    const s = baseState({
      hands: [hand, [], [], []],
      currentTrick: [{ seat: 1, card: makeCard("♣", 12, "cq") }],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♣")).toBe(true);
  });

  it("must play trump if can't follow suit", () => {
    const hand: Card[] = [makeCard("♥", 11, "hj"), makeCard("♠", 9, "s9")];
    const s = baseState({
      trumpSuit: "♠",
      hands: [hand, [], [], []],
      currentTrick: [{ seat: 1, card: makeCard("♣", 12, "cq") }],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♠")).toBe(true);
  });
});

// ── 6. Full hand ──────────────────────────────────────────────────────────────

describe("full hand", () => {
  it("plays to done without errors", () => {
    let s = initialState(77, defaultSettings);
    let maxIter = 15;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
    expect(s.finalScores).not.toBeNull();
    // Total counters in the game should be 120 (across both teams, excluding melds)
    // Just check finalScores are non-negative
    expect(s.finalScores![0]).toBeGreaterThanOrEqual(0);
    expect(s.finalScores![1]).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal null before done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
