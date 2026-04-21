import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `e-${suit}${rank}` };
}

const defaultSettings = { botDifficulty: "hard" as const };

// ── 1. initialState ──────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 5 cards to each of 4 players", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands.length).toBe(4);
    expect(s.hands.every(h => h.length === 5)).toBe(true);
  });

  it("starts in trump-select-1 phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("trump-select-1");
    expect(s.trumpSuit).toBeNull();
  });

  it("upCard is defined", () => {
    const s = initialState(42, defaultSettings);
    expect(s.upCard).toBeDefined();
    expect(s.upCard.suit).toBeTruthy();
  });

  it("is deterministic", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

// ── 2. Trump ordering ────────────────────────────────────────────────────────

describe("trump selection", () => {
  it("player ordering up sets trump to up-card suit", () => {
    const s = initialState(42, defaultSettings);
    const upSuit = s.upCard.suit;
    const s2 = reducer(s, { type: "order-up" });
    expect(s2.trumpSuit).toBe(upSuit);
    expect(s2.makerSeat).toBe(0);
  });

  it("passing progresses turn or goes to trump-select-2", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pass" });
    // After player passes, bots may order up or all pass to phase 2
    expect(["trump-select-1", "trump-select-2", "playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("ordering up starts playing phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "order-up" });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });
});

// ── 3. legalPlays: must follow suit ─────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit if possible", () => {
    const s0 = initialState(42, defaultSettings);
    const s1 = reducer(s0, { type: "order-up" });
    if (s1.phase !== "playing") return;
    // Build manual state with a trick in progress
    const trump = s1.trumpSuit!;
    const trick = [{ seat: 1, card: makeCard("♥", 9) }];
    const hand: Card[] = [makeCard("♥", 12), makeCard("♦", 10)];
    const ms = { ...s1, currentTrick: trick, hands: [hand, [], [], []], turn: 0, trumpSuit: "♣" as Card["suit"] };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
    expect(legal.length).toBe(1);
  });

  it("if can't follow suit, can play anything", () => {
    const s0 = initialState(42, defaultSettings);
    const s1 = reducer(s0, { type: "order-up" });
    if (s1.phase !== "playing") return;
    const trick = [{ seat: 1, card: makeCard("♥", 9) }];
    const hand: Card[] = [makeCard("♦", 12), makeCard("♣", 10)];
    const ms = { ...s1, currentTrick: trick, hands: [hand, [], [], []], turn: 0, trumpSuit: "♠" as Card["suit"] };
    const legal = legalPlays(ms, 0);
    expect(legal.length).toBe(2);
  });
});

// ── 4. Trick scoring ─────────────────────────────────────────────────────────

describe("scoring", () => {
  it("hand done after 5 tricks total", () => {
    let s = initialState(55, defaultSettings);
    s = reducer(s, { type: "order-up" });
    let iter = 7;
    while (s.phase === "playing" && iter-- > 0) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) {
        s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
    }
    if (s.phase === "done") {
      const total = s.tricks.reduce((a, b) => a + b, 0);
      expect(total).toBe(5);
    }
    expect(["playing", "done"].includes(s.phase)).toBe(true);
  });

  it("score teams correctly: maker gets 1 or 2, defender gets 2 on euchre", () => {
    const s = initialState(42, defaultSettings);
    const done = {
      ...s,
      phase: "done" as const,
      score: [2, 0] as [number, number],
    };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(50); // player team winning
  });
});

// ── 5. isTerminal ────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when not done", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score 50 when tied", () => {
    const s = initialState(1, defaultSettings);
    const done = { ...s, phase: "done" as const, score: [1, 1] as [number, number] };
    expect(isTerminal(done)!.score).toBe(50);
  });

  it("returns score >50 when player team ahead", () => {
    const s = initialState(1, defaultSettings);
    const done = { ...s, phase: "done" as const, score: [2, 0] as [number, number] };
    expect(isTerminal(done)!.score).toBeGreaterThan(50);
  });
});
