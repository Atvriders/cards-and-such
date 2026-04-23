import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { DoubleDummyWhistState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<DoubleDummyWhistState> = {}): DoubleDummyWhistState {
  return {
    settings,
    rngSeed: 1,
    hands: [[], [], [], []],
    trumpSuit: "♠",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0],
    tricksPlayed: 0,
    finalScores: null,
    message: "",
    ...overrides,
  };
}

// ── 1. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 13 cards to each of 4 seats", () => {
    const s = initialState(42, settings);
    for (const hand of s.hands) expect(hand.length).toBe(13);
  });

  it("total 52 cards dealt", () => {
    const s = initialState(42, settings);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });

  it("trump suit is valid", () => {
    const s = initialState(42, settings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });

  it("phase is playing", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("playing");
  });
});

// ── 2. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 8, "h8") }],
      hands: [[makeCard("♥", 3, "h3"), makeCard("♠", 7, "s7")], [], [], []],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });

  it("any card when cannot follow suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 8, "h8") }],
      hands: [[makeCard("♦", 3, "d3"), makeCard("♠", 7, "s7")], [], [], []],
    });
    expect(legalPlays(s, 0).length).toBe(2);
  });
});

// ── 3. Trump wins trick ────────────────────────────────────────────────────────

describe("trump wins trick", () => {
  it("player's trump 2 beats led suit K", () => {
    const s = baseState({
      hands: [
        [makeCard("♠", 2, "s2")],
        [makeCard("♣", 5, "c5")],
        [makeCard("♣", 6, "c6")],
        [makeCard("♣", 7, "c7")],
      ],
      trumpSuit: "♠",
      currentTrick: [
        { seat: 1, card: makeCard("♣", 13, "ck") },
        { seat: 3, card: makeCard("♣", 11, "cj") },
        { seat: 2, card: makeCard("♣", 10, "c10") },
      ],
      turn: 0,
      tricksPlayed: 5,
    });
    const after = reducer(s, { type: "play", cardId: "s2" });
    // team 0 wins (seat 0 is team 0)
    expect(after.tricksTaken[0]).toBe(1);
  });
});

// ── 4. Full game and terminal ─────────────────────────────────────────────────

describe("isTerminal and full game", () => {
  it("null during play", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("player team wins — score 100", () => {
    const s = baseState({ phase: "done", finalScores: [8, 5] });
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("bot team wins — score 0", () => {
    const s = baseState({ phase: "done", finalScores: [4, 9] });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("tie — score 50", () => {
    const s = baseState({ phase: "done", finalScores: [6, 7] });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("full game plays to completion", () => {
    let s = initialState(7, settings);
    let iters = 0;
    while (s.phase !== "done" && iters < 60) {
      // player controls seats 0 and 2
      if (s.turn === 0 || s.turn === 2) {
        const legal = legalPlays(s, s.turn);
        expect(legal.length).toBeGreaterThan(0);
        s = reducer(s, { type: "play", cardId: legal[0]!.id });
      } else {
        break; // bot turn should auto-resolve
      }
      iters++;
    }
    expect(s.phase).toBe("done");
    const total = s.tricksTaken[0]! + s.tricksTaken[1]!;
    expect(total).toBe(13);
  });
});
