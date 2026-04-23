import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { KnockOutWhistState } from "./state.js";

const defaultSettings = { opponents: "2" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<KnockOutWhistState> = {}): KnockOutWhistState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    seats: 3,
    active: [true, true, true],
    hands: [[], [], []],
    trumpSuit: "♠",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0],
    tricksInRound: 0,
    cardsPerRound: 7,
    roundNumber: 1,
    finalWinner: null,
    message: "",
    ...overrides,
  };
}

// ── 1. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 7 cards per player in round 1", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(7);
    expect(s.hands[1]!.length).toBe(7);
    expect(s.hands[2]!.length).toBe(7);
  });

  it("all players active at start", () => {
    const s = initialState(42, defaultSettings);
    expect(s.active.every(Boolean)).toBe(true);
  });

  it("cardsPerRound is 7 in round 1", () => {
    const s = initialState(42, defaultSettings);
    expect(s.cardsPerRound).toBe(7);
  });

  it("trump suit is valid", () => {
    const s = initialState(42, defaultSettings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });
});

// ── 2. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 8, "h8") }],
      hands: [[makeCard("♥", 3, "h3"), makeCard("♦", 7, "d7")], [], []],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });

  it("any card when cannot follow suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 8, "h8") }],
      hands: [[makeCard("♠", 3, "s3"), makeCard("♦", 7, "d7")], [], []],
    });
    expect(legalPlays(s, 0).length).toBe(2);
  });
});

// ── 3. Trump wins trick ────────────────────────────────────────────────────────

describe("trump wins trick", () => {
  it("trump 2 beats led suit King", () => {
    const playerCard = makeCard("♠", 2, "s2");
    const s = baseState({
      seats: 3,
      hands: [[playerCard], [makeCard("♦", 5, "d5")], [makeCard("♦", 3, "d3")]],
      currentTrick: [
        { seat: 1, card: makeCard("♦", 13, "dk") },
        { seat: 2, card: makeCard("♦", 11, "dj") },
      ],
      trumpSuit: "♠",
      turn: 0,
    });
    const after = reducer(s, { type: "play", cardId: "s2" });
    expect(after.tricksTaken[0]).toBe(1);
  });
});

// ── 4. Elimination / isTerminal ───────────────────────────────────────────────

describe("isTerminal", () => {
  it("null during playing", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score 100 when player wins", () => {
    const s = baseState({ phase: "done", finalWinner: 0 });
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("score 0 when bot wins", () => {
    const s = baseState({ phase: "done", finalWinner: 1 });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("next-round action transitions between-rounds to playing", () => {
    const s = baseState({ phase: "between-rounds", roundNumber: 1, active: [true, true, false] });
    const after = reducer(s, { type: "next-round" });
    expect(after.phase).toBe("playing");
    expect(after.roundNumber).toBe(2);
  });

  it("game starts and first trick resolves correctly", () => {
    let s = initialState(7, defaultSettings);
    expect(s.phase).toBe("playing");
    const legal = legalPlays(s, 0);
    expect(legal.length).toBeGreaterThan(0);
    s = reducer(s, { type: "play", cardId: legal[0]!.id });
    // After playing, bots should have played too, ending the first trick
    expect(s.tricksInRound).toBeGreaterThanOrEqual(1);
  });
});
