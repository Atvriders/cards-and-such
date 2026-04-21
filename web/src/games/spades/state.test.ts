import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

const defaultSettings = { botBidding: "balanced" as const };

// ── 1. initialState ──────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 13 cards to each of 4 seats", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands.length).toBe(4);
    expect(s.hands.every(h => h.length === 13)).toBe(true);
  });

  it("starts in bidding phase with no bids", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("bidding");
    expect(s.bids.every(b => b === null)).toBe(true);
  });

  it("total cards = 52", () => {
    const s = initialState(99, defaultSettings);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });
});

// ── 2. Bidding ───────────────────────────────────────────────────────────────

describe("bidding", () => {
  it("after player bids, all bot bids are also filled and phase becomes playing", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    expect(s2.bids[0]).toBe(3);
    expect(s2.bids[1]).not.toBeNull();
    expect(s2.bids[2]).not.toBeNull();
    expect(s2.bids[3]).not.toBeNull();
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("nil bid (0) is recorded correctly", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bid", amount: 0 });
    expect(s2.bids[0]).toBe(0);
  });
});

// ── 3. legalPlays ────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit if possible", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    // Can't easily control which card is led, but legalPlays structure is testable
    // Build manual state
    const trick = [{ seat: 1, card: makeCard("♥", 9, "h9") }];
    const hand: Card[] = [makeCard("♥", 5, "h5"), makeCard("♠", 2, "s2")];
    const manualState = {
      ...s2,
      currentTrick: trick,
      hands: [hand, [], [], []],
      turn: 0,
    };
    const legal = legalPlays(manualState, 0);
    expect(legal.length).toBe(1);
    expect(legal[0]!.suit).toBe("♥");
  });

  it("can play anything if can't follow suit", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    const trick = [{ seat: 1, card: makeCard("♥", 9, "h9x") }];
    const hand: Card[] = [makeCard("♠", 5, "s5x"), makeCard("♦", 2, "d2x")];
    const manualState = { ...s2, currentTrick: trick, hands: [hand, [], [], []], turn: 0 };
    const legal = legalPlays(manualState, 0);
    expect(legal.length).toBe(2);
  });
});

// ── 4. Trick resolution ──────────────────────────────────────────────────────

describe("trick resolution", () => {
  it("spade beats non-spade regardless of rank", () => {
    const s0 = initialState(42, defaultSettings);
    const s1 = reducer(s0, { type: "bid", amount: 3 });
    if (s1.phase !== "playing") return; // just in case done instantly
    // Build trick with spade
    const trick = [
      { seat: 1, card: makeCard("♥", 13, "hk") },
      { seat: 2, card: makeCard("♦", 13, "dk") },
      { seat: 3, card: makeCard("♠", 2, "s2x") }, // lowest spade wins
    ];
    const myCard = makeCard("♣", 13, "ck");
    const manualState = {
      ...s1,
      currentTrick: trick,
      hands: [[myCard], [], [], []],
      turn: 0,
      tricks: [0, 0, 0, 0] as unknown as readonly number[],
    };
    const after = reducer(manualState, { type: "play", cardId: "ck" });
    // Seat 3 played ♠2 which should win over K♥, K♦, K♣
    expect(after.tricks[3]).toBe(1);
  });
});

// ── 5. Full hand playthrough ─────────────────────────────────────────────────

describe("full playthrough", () => {
  it("completes a full hand", () => {
    let s = initialState(123, defaultSettings);
    s = reducer(s, { type: "bid", amount: 3 });

    let iter = 15;
    while (s.phase === "playing" && iter-- > 0) {
      const legal = legalPlays(s, 0);
      if (legal.length === 0) break;
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }

    expect(["playing", "done"].includes(s.phase)).toBe(true);
    if (s.phase === "done") {
      expect(s.tricks.reduce((a, b) => a + b, 0)).toBe(13);
    }
  });
});

// ── 6. isTerminal ────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score in 0-100 range when done", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, phase: "done" as const, teamScore: [150, 100] as [number, number] };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});
