import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, detectMelds, isWild, cardDeadwoodValue } from "./state.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `fc-${suit}${rank}` };
}

function makeWild(id = "fc-wild1"): Card {
  return { suit: "♠", rank: 3, id };
}

const defaultSettings = { botCount: 1 as const };

// ── 1. isWild ────────────────────────────────────────────────────────────────

describe("isWild", () => {
  it("rank 3 is wild", () => {
    expect(isWild(makeCard("♠", 3))).toBe(true);
  });

  it("joker id is wild", () => {
    expect(isWild({ suit: "♠", rank: 3, id: "fc-joker1" })).toBe(true);
  });

  it("rank 7 is not wild", () => {
    expect(isWild(makeCard("♠", 7))).toBe(false);
  });
});

// ── 2. cardDeadwoodValue ──────────────────────────────────────────────────────

describe("cardDeadwoodValue", () => {
  it("wild card = 0", () => {
    expect(cardDeadwoodValue(makeWild())).toBe(0);
  });
  it("Ace = 1", () => expect(cardDeadwoodValue(makeCard("♠", 1))).toBe(1));
  it("7 = 7", () => expect(cardDeadwoodValue(makeCard("♠", 7))).toBe(7));
  it("King = 10", () => expect(cardDeadwoodValue(makeCard("♠", 13))).toBe(10));
});

// ── 3. detectMelds ──────────────────────────────────────────────────────────

describe("detectMelds", () => {
  it("set of 3 same-rank = meld", () => {
    const hand: Card[] = [makeCard("♠", 7), makeCard("♥", 7), makeCard("♦", 7), makeCard("♣", 5)];
    const r = detectMelds(hand);
    expect(r.melds.length).toBeGreaterThan(0);
    expect(r.deadwood.length).toBe(1);
    expect(r.deadwood[0]!.rank).toBe(5);
  });

  it("run of 3 consecutive same suit = meld", () => {
    const hand: Card[] = [makeCard("♠", 5), makeCard("♠", 6), makeCard("♠", 7), makeCard("♥", 9)];
    const r = detectMelds(hand);
    const run = r.melds.find(m => m.every(c => c.suit === "♠"));
    expect(run).toBeDefined();
    expect(r.deadwoodValue).toBe(9);
  });

  it("wild card fills a set", () => {
    const hand: Card[] = [makeCard("♠", 9), makeCard("♥", 9), makeWild("fc-w1")];
    const r = detectMelds(hand);
    expect(r.deadwoodValue).toBe(0);
  });

  it("zero deadwood when all melded", () => {
    const hand: Card[] = [
      makeCard("♠", 5), makeCard("♥", 5), makeCard("♦", 5),
      makeCard("♣", 8), makeCard("♣", 9), makeCard("♣", 10),
    ];
    const r = detectMelds(hand);
    expect(r.deadwoodValue).toBe(0);
  });
});

// ── 4. initialState ─────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 11 cards to each player", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(11);
    expect(s.hands[1]!.length).toBe(11);
  });

  it("starts in player-draw phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("player-draw");
  });

  it("is deterministic", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("total cards accounted for", () => {
    const s = initialState(42, { botCount: 3 });
    const inHands = s.hands.reduce((n, h) => n + h.length, 0);
    const total = inHands + s.stock.length + s.discardPile.length;
    expect(total).toBe(54); // 52 + 2 jokers
  });
});

// ── 5. Draw actions ─────────────────────────────────────────────────────────

describe("draw actions", () => {
  it("drawing from stock adds card to hand", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "draw", from: "stock" });
    expect(s2.hands[0]!.length).toBe(12);
    expect(s2.phase).toBe("player-discard");
  });

  it("drawing from discard takes top card", () => {
    const s = initialState(42, defaultSettings);
    const topId = s.discardPile[s.discardPile.length - 1]!.id;
    const s2 = reducer(s, { type: "draw", from: "discard" });
    expect(s2.hands[0]!.some(c => c.id === topId)).toBe(true);
  });
});

// ── 6. Discard action ────────────────────────────────────────────────────────

describe("discard action", () => {
  it("discarding removes card from hand and runs bots", () => {
    const s0 = initialState(10, defaultSettings);
    const s1 = reducer(s0, { type: "draw", from: "stock" });
    const toDiscard = s1.hands[0]![0]!;
    const s2 = reducer(s1, { type: "discard", cardId: toDiscard.id });
    expect(s2.hands[0]!.length).toBe(11); // back to 11 after discard
    expect(["player-draw", "done"].includes(s2.phase)).toBe(true);
  });
});

// ── 7. Go-out action ─────────────────────────────────────────────────────────

describe("go-out action", () => {
  it("cannot go out when deadwood > 0", () => {
    const s0 = initialState(42, defaultSettings);
    const s1 = reducer(s0, { type: "draw", from: "stock" });
    const { deadwoodValue } = detectMelds(s1.hands[0]!);
    if (deadwoodValue > 0) {
      const s2 = reducer(s1, { type: "go-out" });
      expect(s2.phase).toBe("player-discard");
      expect(s2.message).toContain("Can't go out");
    } else {
      // Can go out
      const s2 = reducer(s1, { type: "go-out" });
      expect(["done", "player-discard"].includes(s2.phase)).toBe(true);
    }
  });
});

// ── 8. isTerminal ────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when not done", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score >=0 when done", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, phase: "done" as const, deadwoodScores: [0, 30] };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});
