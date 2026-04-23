import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, cardPoints, new32Deck } from "./state.js";
import type { TwentyNineState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function basePlayingState(overrides: Partial<TwentyNineState> = {}): TwentyNineState {
  return {
    settings,
    rngSeed: 1,
    hands: [
      [makeCard("♣", 11, "cj"), makeCard("♣", 9, "c9"), makeCard("♣", 1, "ca"), makeCard("♣", 8, "c8"),
       makeCard("♠", 7, "s7"), makeCard("♠", 8, "s8"), makeCard("♠", 9, "s9"), makeCard("♠", 10, "s10")],
      [makeCard("♥", 11, "hj"), makeCard("♥", 9, "h9"), makeCard("♥", 1, "ha"), makeCard("♥", 8, "h8"),
       makeCard("♦", 7, "d7"), makeCard("♦", 8, "d8"), makeCard("♦", 9, "d9"), makeCard("♦", 10, "d10")],
      [makeCard("♣", 12, "cq"), makeCard("♣", 13, "ck"), makeCard("♣", 7, "c7"), makeCard("♠", 11, "sj"),
       makeCard("♠", 1, "sa"), makeCard("♠", 12, "sq"), makeCard("♠", 13, "sk"), makeCard("♥", 7, "h7")],
      [makeCard("♥", 12, "hq"), makeCard("♥", 13, "hk"), makeCard("♥", 10, "h10"), makeCard("♦", 11, "dj"),
       makeCard("♦", 1, "da"), makeCard("♦", 12, "dq"), makeCard("♦", 13, "dk"), makeCard("♣", 10, "c10")],
    ],
    trumpSuit: "♣",
    trumpRevealed: false,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0],
    pointsTaken: [0, 0],
    tricksPlayed: 0,
    bid: 20,
    bidTeam: 0,
    bids: [20, 18, 15, 16],
    finalScores: null,
    message: "",
    ...overrides,
  };
}

// ── 1. new32Deck ──────────────────────────────────────────────────────────────

describe("new32Deck", () => {
  it("has exactly 32 cards", () => {
    expect(new32Deck().length).toBe(32);
  });

  it("no cards with rank 2-6", () => {
    const deck = new32Deck();
    expect(deck.every(c => c.rank === 1 || c.rank >= 7)).toBe(true);
  });
});

// ── 2. cardPoints ─────────────────────────────────────────────────────────────

describe("cardPoints", () => {
  it("Jack = 3", () => expect(cardPoints(makeCard("♣", 11))).toBe(3));
  it("Nine = 2", () => expect(cardPoints(makeCard("♣", 9))).toBe(2));
  it("Ace = 1", () => expect(cardPoints(makeCard("♣", 1))).toBe(1));
  it("Ten = 1", () => expect(cardPoints(makeCard("♣", 10))).toBe(1));
  it("Seven = 0", () => expect(cardPoints(makeCard("♣", 7))).toBe(0));
  it("King = 0", () => expect(cardPoints(makeCard("♣", 13))).toBe(0));
});

// ── 3. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 8 cards to each of 4 players", () => {
    const s = initialState(42, settings);
    for (const hand of s.hands) expect(hand.length).toBe(8);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("bidding");
  });

  it("total 32 cards dealt", () => {
    const s = initialState(42, settings);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(32);
  });
});

// ── 4. Bidding → playing ──────────────────────────────────────────────────────

describe("bidding", () => {
  it("bid action moves to playing phase", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "bid", amount: 20 });
    expect(after.phase).toBe("playing");
  });

  it("bid is set on resulting state", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "bid", amount: 20 });
    expect(after.bid).toBeGreaterThanOrEqual(15);
  });
});

// ── 5. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit", () => {
    const s = basePlayingState({
      currentTrick: [{ seat: 3, card: makeCard("♣", 7, "c7x") }],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♣")).toBe(true);
  });

  it("all cards when leading", () => {
    const s = basePlayingState({ currentTrick: [] });
    expect(legalPlays(s, 0).length).toBe(8);
  });
});

// ── 6. isTerminal ─────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("null during play", () => {
    const s = basePlayingState();
    expect(isTerminal(s)).toBeNull();
  });

  it("player team wins when bid made", () => {
    const s = basePlayingState({
      phase: "done",
      finalScores: [21, 8],
      bid: 20,
      bidTeam: 0,
    });
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("player team loses when bid not made", () => {
    const s = basePlayingState({
      phase: "done",
      finalScores: [14, 15],
      bid: 20,
      bidTeam: 0,
    });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("full game plays to completion after bidding", () => {
    let s = initialState(7, settings);
    s = reducer(s, { type: "bid", amount: 18 });
    expect(s.phase).toBe("playing");
    let iters = 0;
    while (s.phase !== "done" && iters < 20) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iters++;
    }
    expect(s.phase).toBe("done");
  });
});
