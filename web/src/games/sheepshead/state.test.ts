import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, makeSheepsheadDeck, counterValue } from "./state.js";
import type { SheepsheadState } from "./state.js";

const defaultSettings = { botDifficulty: "standard" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<SheepsheadState> = {}): SheepsheadState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], [], [], []],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0, 0, 0],
    takenCards: [[], [], [], [], []],
    tricksPlayed: 0,
    pickerScore: null,
    opponentScore: null,
    ...overrides,
  };
}

// ── 1. Deck ───────────────────────────────────────────────────────────────────

describe("makeSheepsheadDeck", () => {
  it("has 32 cards", () => {
    expect(makeSheepsheadDeck().length).toBe(32);
  });

  it("has 8 cards per suit", () => {
    const deck = makeSheepsheadDeck();
    for (const suit of ["♠", "♥", "♦", "♣"]) {
      expect(deck.filter(c => c.suit === suit).length).toBe(8);
    }
  });
});

// ── 2. Counter values ─────────────────────────────────────────────────────────

describe("counterValue", () => {
  it("Ace=11, 10=10, K=4, Q=3, J=2, others=0", () => {
    expect(counterValue(1)).toBe(11);
    expect(counterValue(10)).toBe(10);
    expect(counterValue(13)).toBe(4);
    expect(counterValue(12)).toBe(3);
    expect(counterValue(11)).toBe(2);
    expect(counterValue(7)).toBe(0);
    expect(counterValue(8)).toBe(0);
  });
});

// ── 3. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 6 cards to each of 5 players (picker has 6 after blind pickup)", () => {
    const s = initialState(42, defaultSettings);
    // Picker (seat 0) picks up 2 blind and discards 2, so still 6
    expect(s.hands[0]!.length).toBe(6);
    for (let i = 1; i < 5; i++) expect(s.hands[i]!.length).toBe(6);
  });

  it("starts in playing phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("playing");
  });

  it("turn starts at 0", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe(0);
  });
});

// ── 4. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("all cards legal when leading", () => {
    const hand: Card[] = [makeCard("♣", 7), makeCard("♥", 8)];
    const s = baseState({ hands: [hand, [], [], [], []], currentTrick: [] });
    expect(legalPlays(s, 0).length).toBe(2);
  });

  it("must follow trump when trump led (Q is trump)", () => {
    // Q is trump; if led with Q♠ (trump), must follow with trump if have any
    const trumpCard = makeCard("♠", 12, "qs"); // Q♠ = trump
    const trick = [{ seat: 1, card: trumpCard }];
    const clubCard = makeCard("♣", 7, "c7"); // also trump (clubs)
    const heartCard = makeCard("♥", 7, "h7"); // not trump
    const hand: Card[] = [clubCard, heartCard];
    const s = baseState({ hands: [hand, [], [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    // clubCard is trump, so must follow trump
    expect(legal.every(c => c.suit === "♣" || c.rank === 11 || c.rank === 12)).toBe(true);
  });

  it("can play any card when cannot follow", () => {
    const trick = [{ seat: 1, card: makeCard("♣", 13, "ck") }]; // clubs led (trump)
    const hand: Card[] = [makeCard("♥", 8, "h8"), makeCard("♦", 9, "d9")]; // no trump
    const s = baseState({ hands: [hand, [], [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    expect(legal.length).toBe(2);
  });
});

// ── 5. Full hand ──────────────────────────────────────────────────────────────

describe("full hand", () => {
  it("plays 6 tricks to done", () => {
    let s = initialState(42, defaultSettings);
    let maxIter = 8;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
    expect(s.pickerScore).not.toBeNull();
    expect(s.opponentScore).not.toBeNull();
    // Total counters = 120
    expect(s.pickerScore! + s.opponentScore!).toBe(120);
  });

  it("isTerminal reflects picker win condition", () => {
    const win = baseState({ phase: "done", pickerScore: 61, opponentScore: 59 });
    expect(isTerminal(win)!.score).toBe(100);
    const lose = baseState({ phase: "done", pickerScore: 60, opponentScore: 60 });
    expect(isTerminal(lose)!.score).toBe(0);
  });

  it("isTerminal null before done", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
});
