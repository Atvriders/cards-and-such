import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, isValidMeld, canLayOffCard, cardMeldValue } from "./state.js";
import type { TableMeld } from "./state.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

const defaultSettings = { numBots: 1 as const };

// ── 1. isValidMeld ──────────────────────────────────────────────────────────

describe("isValidMeld", () => {
  it("validates a set of 3 same-rank cards", () => {
    const cards: Card[] = [makeCard("♠", 7), makeCard("♥", 7), makeCard("♦", 7)];
    expect(isValidMeld(cards)).toBe(true);
  });

  it("rejects a 2-card set", () => {
    expect(isValidMeld([makeCard("♠", 7), makeCard("♥", 7)])).toBe(false);
  });

  it("validates a run of 3 consecutive same-suit", () => {
    const cards: Card[] = [makeCard("♠", 5), makeCard("♠", 6), makeCard("♠", 7)];
    expect(isValidMeld(cards)).toBe(true);
  });

  it("rejects a non-consecutive run", () => {
    const cards: Card[] = [makeCard("♠", 5), makeCard("♠", 6), makeCard("♠", 8)];
    expect(isValidMeld(cards)).toBe(false);
  });

  it("rejects a mixed-suit run", () => {
    const cards: Card[] = [makeCard("♠", 5), makeCard("♥", 6), makeCard("♠", 7)];
    expect(isValidMeld(cards)).toBe(false);
  });

  it("accepts a 4-card set", () => {
    const cards: Card[] = [makeCard("♠", 9), makeCard("♥", 9), makeCard("♦", 9), makeCard("♣", 9)];
    expect(isValidMeld(cards)).toBe(true);
  });
});

// ── 2. canLayOffCard ─────────────────────────────────────────────────────────

describe("canLayOffCard", () => {
  it("can extend a run by one at the high end", () => {
    const meld: TableMeld = {
      id: "m1",
      cards: [makeCard("♠", 5, "s5"), makeCard("♠", 6, "s6"), makeCard("♠", 7, "s7")],
      owner: 0,
    };
    expect(canLayOffCard(makeCard("♠", 8, "s8"), meld)).toBe(true);
  });

  it("can extend a run by one at the low end", () => {
    const meld: TableMeld = {
      id: "m2",
      cards: [makeCard("♠", 5, "s5"), makeCard("♠", 6, "s6"), makeCard("♠", 7, "s7")],
      owner: 0,
    };
    expect(canLayOffCard(makeCard("♠", 4, "s4"), meld)).toBe(true);
  });

  it("cannot extend a run with wrong suit", () => {
    const meld: TableMeld = {
      id: "m3",
      cards: [makeCard("♠", 5, "s5"), makeCard("♠", 6, "s6"), makeCard("♠", 7, "s7")],
      owner: 0,
    };
    expect(canLayOffCard(makeCard("♥", 8, "h8"), meld)).toBe(false);
  });

  it("can extend a set with 4th card", () => {
    const meld: TableMeld = {
      id: "m4",
      cards: [makeCard("♠", 9, "s9"), makeCard("♥", 9, "h9"), makeCard("♦", 9, "d9")],
      owner: 0,
    };
    expect(canLayOffCard(makeCard("♣", 9, "c9"), meld)).toBe(true);
  });

  it("cannot extend a set with duplicate suit", () => {
    const meld: TableMeld = {
      id: "m5",
      cards: [makeCard("♠", 9, "s9"), makeCard("♥", 9, "h9"), makeCard("♦", 9, "d9")],
      owner: 0,
    };
    expect(canLayOffCard(makeCard("♠", 9, "s9b"), meld)).toBe(false);
  });
});

// ── 3. cardMeldValue ────────────────────────────────────────────────────────

describe("cardMeldValue", () => {
  it("Ace = 1", () => expect(cardMeldValue(1)).toBe(1));
  it("7 = 7", () => expect(cardMeldValue(7)).toBe(7));
  it("Jack = 10", () => expect(cardMeldValue(11)).toBe(10));
  it("King = 10", () => expect(cardMeldValue(13)).toBe(10));
});

// ── 4. initialState ─────────────────────────────────────────────────────────

describe("initialState", () => {
  it("2-player game deals 10 cards each", () => {
    const s = initialState(42, { numBots: 1 });
    expect(s.hands[0]!.length).toBe(10);
    expect(s.hands[1]!.length).toBe(10);
    expect(s.discardPile.length).toBe(1);
    expect(s.stock.length).toBe(31);
  });

  it("3-player game deals 7 cards each", () => {
    const s = initialState(42, { numBots: 2 });
    expect(s.hands.every(h => h.length === 7)).toBe(true);
    expect(s.numPlayers).toBe(3);
  });

  it("starts in player-draw phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("player-draw");
  });
});

// ── 5. Draw actions ─────────────────────────────────────────────────────────

describe("draw actions", () => {
  it("draw-stock adds a card to player hand", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "draw-stock" });
    expect(s2.hands[0]!.length).toBe(11);
    expect(s2.phase).toBe("player-meld");
  });

  it("draw-discard takes top discard card", () => {
    const s = initialState(42, defaultSettings);
    const topId = s.discardPile[s.discardPile.length - 1]!.id;
    const s2 = reducer(s, { type: "draw-discard" });
    expect(s2.hands[0]!.some(c => c.id === topId)).toBe(true);
  });
});

// ── 6. Meld action ──────────────────────────────────────────────────────────

describe("meld action", () => {
  it("valid meld adds cards to table and scores points", () => {
    const s = initialState(42, defaultSettings);
    const s1 = reducer(s, { type: "draw-stock" });
    // Find 3 same-rank cards in hand
    const hand = s1.hands[0]!;
    const byRank = new Map<number, Card[]>();
    for (const c of hand) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
    let meldCards: Card[] = [];
    for (const [, cards] of byRank) {
      if (cards.length >= 3) { meldCards = cards.slice(0, 3); break; }
    }
    if (meldCards.length === 3) {
      const s2 = reducer(s1, { type: "meld", cardIds: meldCards.map(c => c.id) });
      expect(s2.tableMelds.length).toBeGreaterThan(0);
      expect(s2.scores[0]).toBeGreaterThan(0);
    } else {
      // No set found, just verify no crash
      expect(s1.phase).toBe("player-meld");
    }
  });
});

// ── 7. isTerminal ────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when not done", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score 0-100 when done", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, phase: "done" as const, scores: [42, 10] };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});
