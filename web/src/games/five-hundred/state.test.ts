import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, make32Deck, isJoker, VALID_BIDS } from "./state.js";
import type { FiveHundredState } from "./state.js";

const defaultSettings = { botBidding: "balanced" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function basePlayingState(overrides: Partial<FiveHundredState> = {}): FiveHundredState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], [], []],
    kitty: [],
    bids: ["pass", "pass", "pass", "pass"],
    contractBid: { level: 6, trump: "♥" },
    contractSeat: 0,
    trumpSuit: "♥",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksTaken: [0, 0, 0, 0],
    tricksPlayed: 0,
    teamScore: [0, 0],
    message: "",
    ...overrides,
  };
}

// ── 1. Deck ───────────────────────────────────────────────────────────────────

describe("make32Deck", () => {
  it("has 53 cards (52 standard + joker)", () => {
    expect(make32Deck().length).toBe(53);
  });

  it("contains exactly one joker", () => {
    const deck = make32Deck();
    expect(deck.filter(isJoker).length).toBe(1);
  });

  it("non-joker cards have ranks 1-13", () => {
    const deck = make32Deck().filter(c => !isJoker(c));
    for (const c of deck) {
      expect(c.rank).toBeGreaterThanOrEqual(1);
      expect(c.rank).toBeLessThanOrEqual(13);
    }
  });
});

// ── 2. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 10 cards to each player and 3 kitty", () => {
    const s = initialState(42, defaultSettings);
    for (const h of s.hands) expect(h.length).toBe(10);
    expect(s.kitty.length).toBe(3);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("bidding");
  });

  it("all bids start as null", () => {
    const s = initialState(42, defaultSettings);
    for (const b of s.bids) expect(b).toBeNull();
  });
});

// ── 3. Bidding ────────────────────────────────────────────────────────────────

describe("bidding phase", () => {
  it("player can pass (bidIndex=-1) without error", () => {
    const s = initialState(10, defaultSettings);
    const after = reducer(s, { type: "bid", bidIndex: -1 });
    // After player passes, bots also bid (or all pass → redeal → bidding again)
    // Either playing or bidding (redeal), both valid
    expect(["bidding", "playing"]).toContain(after.phase);
  });

  it("player bidding transitions to playing after all bids", () => {
    const s = initialState(10, defaultSettings);
    const after = reducer(s, { type: "bid", bidIndex: 0 }); // bid 6♥
    // All 4 bids placed → phase moves to playing
    expect(after.phase).toBe("playing");
  });

  it("contract seat is set after bidding", () => {
    const s = initialState(10, defaultSettings);
    const after = reducer(s, { type: "bid", bidIndex: 0 });
    expect(after.contractSeat).not.toBeNull();
    expect(after.contractBid).not.toBeNull();
  });
});

// ── 4. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("any card legal when leading", () => {
    const hand: Card[] = [makeCard("♣", 10), makeCard("♥", 11), makeCard("♠", 1)];
    const s = basePlayingState({ hands: [hand, [], [], []], currentTrick: [] });
    const legal = legalPlays(s, 0);
    expect(legal.length).toBe(3);
  });

  it("must follow suit when possible", () => {
    const hand: Card[] = [makeCard("♣", 10, "c10"), makeCard("♥", 11, "hj")];
    const trick = [{ seat: 1, card: makeCard("♣", 13, "ck") }];
    const s = basePlayingState({ hands: [hand, [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    expect(legal.length).toBe(1);
    expect(legal[0]!.suit).toBe("♣");
  });

  it("joker can always be played", () => {
    const joker: Card = { suit: "♠", rank: 1, id: "joker" };
    const hand: Card[] = [makeCard("♦", 10, "d10"), joker];
    const trick = [{ seat: 1, card: makeCard("♣", 13, "ck") }];
    const s = basePlayingState({ hands: [hand, [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    // Has no clubs but has joker; should be allowed to play joker (or anything)
    expect(legal.some(c => isJoker(c))).toBe(true);
  });
});

// ── 5. Scoring ────────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("null before done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("team 0 winning gives score 100", () => {
    const s = basePlayingState({ phase: "done", teamScore: [120, 40] });
    expect(isTerminal(s)!.score).toBe(100);
  });

  it("team 0 losing gives score 0", () => {
    const s = basePlayingState({ phase: "done", teamScore: [40, 120] });
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("tie gives score 50", () => {
    const s = basePlayingState({ phase: "done", teamScore: [60, 60] });
    expect(isTerminal(s)!.score).toBe(50);
  });
});

// ── 6. Full hand ──────────────────────────────────────────────────────────────

describe("full hand", () => {
  it("plays to completion without errors", () => {
    // Bid first
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "bid", bidIndex: 2 }); // bid 8♥
    // After bidding, should be playing
    if (s.phase !== "playing") {
      // If we happened to redeal, try bidding again
      s = reducer(s, { type: "bid", bidIndex: 2 });
    }
    expect(s.phase).toBe("playing");

    let maxIter = 12;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
  });

  it("VALID_BIDS has expected entries", () => {
    expect(VALID_BIDS.length).toBe(8);
    expect(VALID_BIDS[0]).toEqual({ level: 6, trump: "♥" });
    expect(VALID_BIDS[5]).toEqual({ level: 6, trump: "NT" });
  });
});
