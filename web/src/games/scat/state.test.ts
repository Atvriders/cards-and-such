import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, handScore } from "./state.js";
import type { ScatState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<ScatState> = {}): ScatState {
  return {
    settings,
    rngSeed: 1,
    hands: [
      [makeCard("♣", 1, "ca"), makeCard("♣", 13, "ck"), makeCard("♣", 12, "cq")],
      [makeCard("♥", 7, "h7"), makeCard("♥", 8, "h8"), makeCard("♥", 9, "h9")],
      [makeCard("♦", 3, "d3"), makeCard("♦", 4, "d4"), makeCard("♦", 5, "d5")],
    ],
    stock: [makeCard("♠", 6, "s6"), makeCard("♠", 7, "s7")],
    discardPile: [makeCard("♠", 2, "s2")],
    phase: "player-turn",
    knockSeat: -1,
    postKnockTurns: 0,
    drawnCard: null,
    drawnFrom: null,
    scores: [0, 0, 0],
    message: "",
    lives: [3, 3, 3],
    ...overrides,
  };
}

// ── 1. handScore ──────────────────────────────────────────────────────────────

describe("handScore", () => {
  it("31 with A+K+Q same suit", () => {
    const hand = [makeCard("♣", 1, "ca"), makeCard("♣", 13, "ck"), makeCard("♣", 12, "cq")];
    expect(handScore(hand)).toBe(31);
  });

  it("three of a kind = 30.5", () => {
    const hand = [makeCard("♣", 7, "c7"), makeCard("♥", 7, "h7"), makeCard("♦", 7, "d7")];
    expect(handScore(hand)).toBe(30.5);
  });

  it("mixed suits count best single suit", () => {
    const hand = [makeCard("♣", 9, "c9"), makeCard("♥", 10, "h10"), makeCard("♣", 8, "c8")];
    // clubs = 9+8=17, hearts=10
    expect(handScore(hand)).toBe(17);
  });

  it("Ace counts 11", () => {
    const hand = [makeCard("♠", 1, "sa"), makeCard("♠", 10, "s10"), makeCard("♣", 5, "c5")];
    expect(handScore(hand)).toBe(21); // A+10 spades = 21
  });
});

// ── 2. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 3 cards to each of 3 players", () => {
    const s = initialState(42, settings);
    expect(s.hands[0]!.length).toBe(3);
    expect(s.hands[1]!.length).toBe(3);
    expect(s.hands[2]!.length).toBe(3);
  });

  it("has a discard pile and stock", () => {
    const s = initialState(42, settings);
    expect(s.discardPile.length).toBeGreaterThan(0);
    expect(s.stock.length).toBeGreaterThan(0);
  });

  it("starts with 3 lives each", () => {
    const s = initialState(42, settings);
    expect(s.lives).toEqual([3, 3, 3]);
  });
});

// ── 3. Draw actions ───────────────────────────────────────────────────────────

describe("draw-stock action", () => {
  it("moves to player-discard phase with drawnCard set", () => {
    const s = baseState();
    const after = reducer(s, { type: "draw-stock" });
    expect(after.phase).toBe("player-discard");
    expect(after.drawnCard).not.toBeNull();
    expect(after.drawnFrom).toBe("stock");
  });

  it("stock count decreases by 1", () => {
    const s = baseState();
    const before = s.stock.length;
    const after = reducer(s, { type: "draw-stock" });
    expect(after.stock.length).toBe(before - 1);
  });
});

describe("draw-discard action", () => {
  it("takes top of discard", () => {
    const s = baseState();
    const top = s.discardPile[s.discardPile.length - 1]!;
    const after = reducer(s, { type: "draw-discard" });
    expect(after.drawnCard?.id).toBe(top.id);
    expect(after.phase).toBe("player-discard");
  });
});

// ── 4. Discard action ─────────────────────────────────────────────────────────

describe("discard action", () => {
  it("after draw, discard results in 3-card hand", () => {
    let s = baseState();
    s = reducer(s, { type: "draw-stock" });
    expect(s.phase).toBe("player-discard");
    const cardToDiscard = s.hands[0]![0]!;
    const before = s.discardPile.length;
    const after = reducer(s, { type: "discard", cardId: cardToDiscard.id });
    // After discard, bots also play which may add to discard pile
    expect(after.discardPile.length).toBeGreaterThanOrEqual(before + 1);
    expect(after.hands[0]!.length).toBe(3);
  });
});

// ── 5. Knock ──────────────────────────────────────────────────────────────────

describe("knock", () => {
  it("knock ends the round immediately", () => {
    const s = baseState();
    const after = reducer(s, { type: "knock" });
    expect(after.phase).toBe("done");
  });

  it("player with 31 survives knock", () => {
    const s = baseState();
    // Player has A+K+Q clubs = 31, bots have much lower scores
    const after = reducer(s, { type: "knock" });
    expect(after.lives[0]).toBe(3); // player keeps all lives
  });

  it("isTerminal returns score when done", () => {
    const s = baseState({ phase: "done", scores: [31, 20, 15], lives: [3, 2, 2] });
    expect(isTerminal(s)).not.toBeNull();
  });
});
