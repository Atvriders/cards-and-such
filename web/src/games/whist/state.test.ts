import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { WhistState } from "./state.js";

const defaultSettings = { botBidding: "balanced" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<WhistState> = {}): WhistState {
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
    tricksPlayed: 0,
    finalScores: null,
    ...overrides,
  };
}

// ── 1. initialState ─────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 52 cards across 4 hands", () => {
    const s = initialState(42, defaultSettings);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });

  it("each hand has exactly 13 cards", () => {
    const s = initialState(42, defaultSettings);
    for (const hand of s.hands) expect(hand.length).toBe(13);
  });

  it("trump suit is a valid suit", () => {
    const s = initialState(42, defaultSettings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });

  it("phase starts as playing", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("playing");
  });

  it("same seed yields same trump suit", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.trumpSuit).toBe(s2.trumpSuit);
  });
});

// ── 2. legalPlays ────────────────────────────────────────────────────────────

describe("legalPlays - must follow suit", () => {
  it("must follow clubs when clubs are led and hand has clubs", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♣", 8) }],
    });
    const hand: Card[] = [makeCard("♣", 3), makeCard("♥", 5)];
    const legal = legalPlays({ ...s, hands: [hand, [], [], []] }, 0);
    expect(legal.every(c => c.suit === "♣")).toBe(true);
    expect(legal.length).toBe(1);
  });

  it("any card allowed when cannot follow suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♣", 8) }],
    });
    const hand: Card[] = [makeCard("♥", 5), makeCard("♠", 3)];
    const legal = legalPlays({ ...s, hands: [hand, [], [], []] }, 0);
    expect(legal.length).toBe(2);
  });

  it("leading: all cards are legal", () => {
    const s = baseState({ currentTrick: [] });
    const hand: Card[] = [makeCard("♣", 3), makeCard("♥", 5), makeCard("♠", 7)];
    const legal = legalPlays({ ...s, hands: [hand, [], [], []] }, 0);
    expect(legal.length).toBe(3);
  });
});

// ── 3. Trump wins trick ──────────────────────────────────────────────────────

describe("trump wins trick", () => {
  it("trump card beats higher-ranked card of led suit", () => {
    // trick: clubs led; seat 0 plays trump (spades) last
    const c1 = makeCard("♣", 13, "ck"); // highest club
    const c2 = makeCard("♣", 11, "cj");
    const c3 = makeCard("♣", 10, "c10");
    const trumpCard = makeCard("♠", 2, "s2"); // lowest trump still wins

    const trick = [
      { seat: 1, card: c1 },
      { seat: 2, card: c2 },
      { seat: 3, card: c3 },
    ];
    const s = baseState({
      turn: 0,
      leadSeat: 1,
      trumpSuit: "♠",
      currentTrick: trick,
      tricksPlayed: 5,
      hands: [[trumpCard], [], [], []],
    });
    const after = reducer(s, { type: "play", cardId: "s2" });
    // seat 0 played ♠2 (trump), should win
    expect(after.tricksTaken[0]).toBe(1);
  });
});

// ── 4. Scoring: tricks above 6 ──────────────────────────────────────────────

describe("scoring", () => {
  it("isTerminal returns null before hand done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("team with more tricks scores points above 6", () => {
    // Team 0 (seats 0,2) takes 9 tricks → 3 points; Team 1 takes 4 → 0 points
    const s = baseState({
      phase: "done",
      finalScores: [3, 0],
    });
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(100); // team 0 wins
  });

  it("losing team scores 0", () => {
    const s = baseState({
      phase: "done",
      finalScores: [0, 4],
    });
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("tie scores 50", () => {
    const s = baseState({
      phase: "done",
      finalScores: [1, 1],
    });
    expect(isTerminal(s)!.score).toBe(50);
  });
});

// ── 5. Full hand completes ───────────────────────────────────────────────────

describe("full hand", () => {
  it("plays a complete hand to done without errors", () => {
    let s = initialState(7, defaultSettings);
    let maxIter = 15;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
    expect(s.finalScores).not.toBeNull();
    // Team tricks must total 13
    const t0 = s.tricksTaken[0]! + s.tricksTaken[2]!;
    const t1 = s.tricksTaken[1]! + s.tricksTaken[3]!;
    expect(t0 + t1).toBe(13);
  });

  it("is deterministic under same seed", () => {
    let s1 = initialState(55, defaultSettings);
    let s2 = initialState(55, defaultSettings);
    let iters = 13;
    while (s1.phase !== "done" && iters-- > 0) {
      const legal = legalPlays(s1, 0);
      const action = { type: "play" as const, cardId: legal[0]!.id };
      s1 = reducer(s1, action);
      s2 = reducer(s2, action);
      expect(s1.tricksTaken).toEqual(s2.tricksTaken);
    }
  });
});
