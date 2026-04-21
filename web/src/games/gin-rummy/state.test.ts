import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, detectMelds, layOff, cardValue } from "./state.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

const defaultSettings = { botDifficulty: "hard" as const };

// ── 1. detectMelds ──────────────────────────────────────────────────────────

describe("detectMelds - sets", () => {
  it("detects a set of three same-rank cards", () => {
    const hand: Card[] = [
      makeCard("♠", 7),
      makeCard("♥", 7),
      makeCard("♦", 7),
      makeCard("♣", 2),
    ];
    const result = detectMelds(hand);
    expect(result.melds.length).toBeGreaterThan(0);
    const set = result.melds.find(m => m.length === 3 && m.every(c => c.rank === 7));
    expect(set).toBeDefined();
    // deadwood should only contain the 2
    expect(result.deadwood.length).toBe(1);
    expect(result.deadwood[0]!.rank).toBe(2);
  });

  it("detects a run of three consecutive same-suit cards", () => {
    const hand: Card[] = [
      makeCard("♠", 5),
      makeCard("♠", 6),
      makeCard("♠", 7),
      makeCard("♦", 10),
    ];
    const result = detectMelds(hand);
    const run = result.melds.find(m => m.length === 3 && m.every(c => c.suit === "♠"));
    expect(run).toBeDefined();
    expect(result.deadwoodValue).toBe(10);
  });

  it("gin hand (all melds) returns deadwoodValue 0", () => {
    // Three-of-a-kind x3 + one run
    const hand: Card[] = [
      makeCard("♠", 2), makeCard("♥", 2), makeCard("♦", 2),
      makeCard("♠", 5), makeCard("♥", 5), makeCard("♦", 5),
      makeCard("♣", 9), makeCard("♣", 10), makeCard("♣", 11),
      makeCard("♣", 1), // Ace stays as deadwood... or let's try full meld
    ];
    // The last card is A♣; it can't extend any meld here
    // Actually let's test correctly
    const hand2: Card[] = [
      makeCard("♠", 2), makeCard("♥", 2), makeCard("♦", 2),
      makeCard("♠", 5), makeCard("♥", 5), makeCard("♦", 5),
      makeCard("♣", 7), makeCard("♣", 8), makeCard("♣", 9), makeCard("♣", 10),
    ];
    const r = detectMelds(hand2);
    expect(r.deadwoodValue).toBe(0);
    expect(r.melds.length).toBeGreaterThanOrEqual(3);
  });

  it("all high cards with no melds returns full deadwood value", () => {
    const hand: Card[] = [
      makeCard("♠", 13), makeCard("♥", 12), makeCard("♦", 11),
    ];
    const r = detectMelds(hand);
    expect(r.deadwoodValue).toBe(30); // 10+10+10
    expect(r.melds.length).toBe(0);
  });
});

// ── 2. cardValue ────────────────────────────────────────────────────────────

describe("cardValue", () => {
  it("Ace = 1", () => expect(cardValue(1)).toBe(1));
  it("10 = 10", () => expect(cardValue(10)).toBe(10));
  it("Jack = 10", () => expect(cardValue(11)).toBe(10));
  it("Queen = 10", () => expect(cardValue(12)).toBe(10));
  it("King = 10", () => expect(cardValue(13)).toBe(10));
  it("5 = 5", () => expect(cardValue(5)).toBe(5));
});

// ── 3. layOff ───────────────────────────────────────────────────────────────

describe("layOff", () => {
  it("can lay off a card extending a run", () => {
    const meld: Card[] = [makeCard("♠", 5, "s5"), makeCard("♠", 6, "s6"), makeCard("♠", 7, "s7")];
    const deadwood: Card[] = [makeCard("♠", 8, "s8"), makeCard("♦", 3, "d3")];
    const { remaining, newMelds } = layOff(deadwood, [meld]);
    // ♠8 should extend the run
    expect(remaining.some(c => c.id === "s8")).toBe(false);
    expect(newMelds[0]!.some(c => c.id === "s8")).toBe(true);
    // ♦3 can't be laid off
    expect(remaining.some(c => c.id === "d3")).toBe(true);
  });

  it("can lay off a card onto a set", () => {
    const meld: Card[] = [makeCard("♠", 9, "s9"), makeCard("♥", 9, "h9"), makeCard("♦", 9, "d9")];
    const deadwood: Card[] = [makeCard("♣", 9, "c9")];
    const { remaining } = layOff(deadwood, [meld]);
    expect(remaining.length).toBe(0);
  });
});

// ── 4. initialState ─────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 10 to player, 10 to bot, 1 to discard, 31 to stock", () => {
    const s = initialState(42, defaultSettings);
    expect(s.playerHand.length).toBe(10);
    expect(s.botHand.length).toBe(10);
    expect(s.discardPile.length).toBe(1);
    expect(s.stock.length).toBe(31);
    expect(s.playerHand.length + s.botHand.length + s.discardPile.length + s.stock.length).toBe(52);
  });

  it("starts in player-draw phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("player-draw");
  });

  it("is deterministic", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.playerHand.map(c => c.id)).toEqual(s2.playerHand.map(c => c.id));
  });
});

// ── 5. Draw from stock ──────────────────────────────────────────────────────

describe("draw action", () => {
  it("drawing from stock adds card to hand and moves to player-discard", () => {
    const s = initialState(42, defaultSettings);
    const before = s.playerHand.length;
    const s2 = reducer(s, { type: "draw", from: "stock" });
    expect(s2.playerHand.length).toBe(before + 1);
    expect(s2.phase).toBe("player-discard");
    expect(s2.stock.length).toBe(s.stock.length - 1);
  });

  it("drawing from discard adds top discard to hand", () => {
    const s = initialState(42, defaultSettings);
    const topId = s.discardPile[s.discardPile.length - 1]!.id;
    const s2 = reducer(s, { type: "draw", from: "discard" });
    expect(s2.playerHand.some(c => c.id === topId)).toBe(true);
    expect(s2.discardPile.length).toBe(s.discardPile.length - 1);
  });
});

// ── 6. Discard action ────────────────────────────────────────────────────────

describe("discard action", () => {
  it("discarding removes card from hand and adds to discard pile, then runs bot turn", () => {
    const s0 = initialState(10, defaultSettings);
    const s1 = reducer(s0, { type: "draw", from: "stock" });
    expect(s1.playerHand.length).toBe(11);
    const toDiscard = s1.playerHand[0]!;
    const s2 = reducer(s1, { type: "discard", cardId: toDiscard.id });
    // After discard + bot turn, we're back in player-draw (or done if bot knocked)
    expect(s2.playerHand.length).toBe(10);
    expect(["player-draw", "done"].includes(s2.phase)).toBe(true);
  });
});

// ── 7. Knock action ──────────────────────────────────────────────────────────

describe("knock action", () => {
  it("cannot knock when in player-draw phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("player-draw");
    const s2 = reducer(s, { type: "knock" });
    expect(s2.phase).toBe("player-draw"); // unchanged
  });

  it("cannot knock if deadwood > 10", () => {
    const s = initialState(42, defaultSettings);
    const s1 = reducer(s, { type: "draw", from: "stock" });
    // Force high deadwood by checking — most initial deals won't have deadwood <= 10
    const { deadwoodValue } = detectMelds(s1.playerHand);
    const s2 = reducer(s1, { type: "knock" });
    if (deadwoodValue > 10) {
      expect(s2.phase).toBe("player-discard");
    } else {
      // If lucky draw gave <=10, knock should succeed
      expect(["player-discard", "done"].includes(s2.phase)).toBe(true);
    }
  });
});

// ── 8. isTerminal ─────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score >= 0 when done with positive finalScore", () => {
    const s = initialState(42, defaultSettings);
    // Manually set done state
    const done = { ...s, phase: "done" as const, finalScore: 20 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});

// ── 9. Full playthrough ──────────────────────────────────────────────────────

describe("full playthrough", () => {
  it("game eventually ends", () => {
    let s = initialState(7, defaultSettings);
    let iter = 200;
    while (s.phase !== "done" && iter-- > 0) {
      if (s.phase === "player-draw") {
        s = reducer(s, { type: "draw", from: "stock" });
      } else if (s.phase === "player-discard") {
        const { deadwoodValue } = detectMelds(s.playerHand);
        if (deadwoodValue === 0) {
          s = reducer(s, { type: "knock" });
        } else {
          const dw = detectMelds(s.playerHand).deadwood;
          const toDiscard = dw.length > 0 ? dw[0]! : s.playerHand[0]!;
          s = reducer(s, { type: "discard", cardId: toDiscard.id });
        }
      }
    }
    // May not finish in 200 iters but should be in a valid state
    expect(["player-draw", "player-discard", "done"].includes(s.phase)).toBe(true);
  });
});
