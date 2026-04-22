import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, bidValue } from "./state.js";
import type { NinetyNineState } from "./state.js";

const defaultSettings = { botDifficulty: "standard" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function basePlayState(overrides: Partial<NinetyNineState> = {}): NinetyNineState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], []],
    bidCards: [[], [], []],
    bids: [3, 4, 2],
    trumpSuit: "♥",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0],
    tricksPlayed: 0,
    finalScores: null,
    ...overrides,
  };
}

// ── 1. bidValue ────────────────────────────────────────────────────────────────

describe("bidValue", () => {
  it("clubs=3, hearts=2, spades=1, diamonds=0", () => {
    expect(bidValue(makeCard("♣", 5))).toBe(3);
    expect(bidValue(makeCard("♥", 5))).toBe(2);
    expect(bidValue(makeCard("♠", 5))).toBe(1);
    expect(bidValue(makeCard("♦", 5))).toBe(0);
  });
});

// ── 2. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 12 cards to each of 3 players", () => {
    const s = initialState(42, defaultSettings);
    for (const h of s.hands) expect(h.length).toBe(12);
  });

  it("starts in bidding phase", () => {
    expect(initialState(42, defaultSettings).phase).toBe("bidding");
  });

  it("trump is hearts", () => {
    expect(initialState(42, defaultSettings).trumpSuit).toBe("♥");
  });
});

// ── 3. Bidding ────────────────────────────────────────────────────────────────

describe("bidding", () => {
  it("putting down 3 cards transitions to playing", () => {
    const s = initialState(42, defaultSettings);
    const h = s.hands[0]!;
    const ids = [h[0]!.id, h[1]!.id, h[2]!.id] as [string, string, string];
    const after = reducer(s, { type: "putDown", cardIds: ids });
    expect(after.phase).toBe("playing");
  });

  it("bid is computed from suits of put-down cards", () => {
    const s = initialState(42, defaultSettings);
    const h = s.hands[0]!;
    // Find specific cards for known bid
    const clubCard = h.find(c => c.suit === "♣");
    const heartCard = h.find(c => c.suit === "♥" && c.id !== clubCard?.id);
    const diamondCard = h.find(c => c.suit === "♦" && c.id !== clubCard?.id && c.id !== heartCard?.id);

    if (clubCard && heartCard && diamondCard) {
      const ids = [clubCard.id, heartCard.id, diamondCard.id] as [string, string, string];
      const after = reducer(s, { type: "putDown", cardIds: ids });
      expect(after.bids[0]).toBe(3 + 2 + 0); // ♣=3, ♥=2, ♦=0
    }
  });

  it("putting same card twice is rejected", () => {
    const s = initialState(42, defaultSettings);
    const h = s.hands[0]!;
    const ids = [h[0]!.id, h[0]!.id, h[1]!.id] as [string, string, string];
    const after = reducer(s, { type: "putDown", cardIds: ids });
    // Should remain in bidding (rejected due to duplicate)
    expect(after.phase).toBe("bidding");
  });
});

// ── 4. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("all cards legal when leading", () => {
    const hand = [makeCard("♣", 5), makeCard("♥", 7), makeCard("♠", 9)];
    const s = basePlayState({ hands: [hand, [], []] });
    expect(legalPlays(s, 0).length).toBe(3);
  });

  it("must follow led suit", () => {
    const trick = [{ seat: 1, card: makeCard("♦", 8) }];
    const hand = [makeCard("♦", 3, "d3"), makeCard("♥", 7, "h7")];
    const s = basePlayState({ hands: [hand, [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♦")).toBe(true);
  });

  it("any card when cannot follow suit", () => {
    const trick = [{ seat: 1, card: makeCard("♦", 8) }];
    const hand = [makeCard("♣", 3), makeCard("♥", 7)];
    const s = basePlayState({ hands: [hand, [], []], currentTrick: trick });
    expect(legalPlays(s, 0).length).toBe(2);
  });
});

// ── 5. Scoring ────────────────────────────────────────────────────────────────

describe("isTerminal and scoring", () => {
  it("null before done", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("score 100 when made bid (+10)", () => {
    const s = basePlayState({ phase: "done", finalScores: [10, -5, 10] });
    expect(isTerminal(s)!.score).toBe(100);
  });

  it("score 0 when missed bid (-5)", () => {
    const s = basePlayState({ phase: "done", finalScores: [-5, 10, 10] });
    expect(isTerminal(s)!.score).toBe(0);
  });
});

// ── 6. Full hand ──────────────────────────────────────────────────────────────

describe("full hand", () => {
  it("plays 9 tricks to done", () => {
    let s = initialState(99, defaultSettings);
    const h = s.hands[0]!;
    const ids = [h[0]!.id, h[1]!.id, h[2]!.id] as [string, string, string];
    s = reducer(s, { type: "putDown", cardIds: ids });
    expect(s.phase).toBe("playing");

    let maxIter = 11;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
    expect(s.finalScores).not.toBeNull();
    expect(s.tricksTaken.reduce((a, b) => a + b, 0)).toBe(9);
  });
});
