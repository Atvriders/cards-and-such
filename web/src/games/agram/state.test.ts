import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { AgramState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<AgramState> = {}): AgramState {
  return {
    settings,
    rngSeed: 1,
    hands: [[], []],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksPlayed: 0,
    lastTrickWinner: -1,
    message: "",
    ...overrides,
  };
}

// ── 1. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 5 cards each from 40-card deck", () => {
    const s = initialState(42, settings);
    expect(s.hands[0]!.length).toBe(5);
    expect(s.hands[1]!.length).toBe(5);
  });

  it("no 5s or 10s in hands", () => {
    const s = initialState(42, settings);
    const all = [...s.hands[0]!, ...s.hands[1]!];
    expect(all.every(c => c.rank !== 5 && c.rank !== 10)).toBe(true);
  });

  it("phase is playing", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("playing");
  });

  it("same seed yields same deal", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.hands[0]![0]?.id).toBe(s2.hands[0]![0]?.id);
  });
});

// ── 2. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♣", 8, "c8") }],
      hands: [[makeCard("♣", 3, "c3"), makeCard("♥", 6, "h6")], []],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♣")).toBe(true);
    expect(legal.length).toBe(1);
  });

  it("any card when cannot follow suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♣", 8, "c8") }],
      hands: [[makeCard("♥", 3, "h3"), makeCard("♦", 6, "d6")], []],
    });
    expect(legalPlays(s, 0).length).toBe(2);
  });
});

// ── 3. No-trump trick winner ──────────────────────────────────────────────────

describe("trick winner — no trump", () => {
  it("highest of led suit wins (off-suit card loses)", () => {
    // Player plays off-suit (higher rank but wrong suit) — bot wins with lower led-suit card
    const s = baseState({
      hands: [[makeCard("♠", 2, "s2")], [makeCard("♦", 9, "d9")]],
      currentTrick: [{ seat: 1, card: makeCard("♦", 6, "d6") }],
      trumpSuit: undefined,
      turn: 0,
      tricksPlayed: 3,
    } as Partial<AgramState>);
    const after = reducer(s, { type: "play", cardId: "s2" });
    // bot led ♦6; player played ♠2 (cannot win); bot wins
    expect(after.lastTrickWinner).toBe(1);
  });

  it("higher led-suit card wins", () => {
    const s = baseState({
      hands: [[makeCard("♣", 13, "ck")], [makeCard("♣", 9, "c9")]],
      currentTrick: [{ seat: 1, card: makeCard("♣", 6, "c6") }],
      turn: 0,
      tricksPlayed: 3,
    });
    const after = reducer(s, { type: "play", cardId: "ck" });
    expect(after.lastTrickWinner).toBe(0);
  });
});

// ── 4. Last trick wins ────────────────────────────────────────────────────────

describe("last trick determines winner", () => {
  it("player winning last trick gives score 100", () => {
    const s = baseState({
      hands: [[makeCard("♣", 13, "ck")], [makeCard("♣", 9, "c9")]],
      currentTrick: [{ seat: 1, card: makeCard("♣", 6, "c6") }],
      turn: 0,
      tricksPlayed: 4, // this is the 5th trick
    });
    const after = reducer(s, { type: "play", cardId: "ck" });
    expect(after.phase).toBe("done");
    expect(isTerminal(after)?.score).toBe(100);
  });

  it("bot winning last trick gives score 0", () => {
    const s = baseState({
      hands: [[makeCard("♣", 2, "c2")], [makeCard("♣", 11, "cj")]],
      currentTrick: [{ seat: 1, card: makeCard("♣", 6, "c6") }],
      turn: 0,
      tricksPlayed: 4,
    });
    const after = reducer(s, { type: "play", cardId: "c2" });
    expect(after.phase).toBe("done");
    expect(isTerminal(after)?.score).toBe(0);
  });

  it("full game plays to completion", () => {
    let s = initialState(7, settings);
    let iters = 0;
    while (s.phase !== "done" && iters < 10) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iters++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
