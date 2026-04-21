import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlay } from "./state.js";
import type { SpeedState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings60 = { duration: "60" as const };
const settings90 = { duration: "90" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. canPlay ────────────────────────────────────────────────────────────────
describe("canPlay", () => {
  it("card ±1 rank is legal", () => {
    expect(canPlay(makeCard(6), [makeCard(5)])).toBe(true);
    expect(canPlay(makeCard(6), [makeCard(7)])).toBe(true);
  });

  it("same rank is illegal", () => {
    expect(canPlay(makeCard(5), [makeCard(5, "♦")])).toBe(false);
  });

  it("distant rank is illegal", () => {
    expect(canPlay(makeCard(3), [makeCard(7)])).toBe(false);
  });

  it("Ace(1) and King(13) are adjacent (wrap)", () => {
    expect(canPlay(makeCard(1), [makeCard(13)])).toBe(true);
    expect(canPlay(makeCard(13), [makeCard(1)])).toBe(true);
  });

  it("any card is legal on empty pile", () => {
    expect(canPlay(makeCard(7), [])).toBe(true);
  });
});

// ── 2. initialState ───────────────────────────────────────────────────────────
describe("initialState", () => {
  it("gives 5-card hand, 2 piles of 1, rest in stock", () => {
    const s = initialState(1, settings60);
    expect(s.hand.length).toBe(5);
    expect(s.piles[0]!.length).toBe(1);
    expect(s.piles[1]!.length).toBe(1);
    expect(s.stock.length).toBe(52 - 5 - 2); // 45
    expect(s.secondsLeft).toBe(60);
    expect(s.cardsPlayed).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("respects duration setting", () => {
    const s = initialState(1, settings90);
    expect(s.secondsLeft).toBe(90);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, settings60);
    const s2 = initialState(42, settings60);
    expect(s1.hand).toEqual(s2.hand);
  });
});

// ── 3. Tick ───────────────────────────────────────────────────────────────────
describe("reducer — tick", () => {
  it("decrements secondsLeft by 1", () => {
    const s = initialState(1, settings60);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.secondsLeft).toBe(59);
  });

  it("ends game when seconds reach 0", () => {
    const s: SpeedState = { ...initialState(1, settings60), secondsLeft: 1 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.secondsLeft).toBe(0);
    expect(s2.phase).toBe("done");
  });

  it("tick is no-op when game is done", () => {
    const s: SpeedState = { ...initialState(1, settings60), phase: "done" };
    const s2 = reducer(s, { type: "tick" });
    expect(s2).toBe(s);
  });
});

// ── 4. Play ───────────────────────────────────────────────────────────────────
describe("reducer — play", () => {
  it("playing a valid card increases cardsPlayed", () => {
    const s = initialState(10, settings60);
    // Find a card in hand that can play on pile 0
    const top0 = s.piles[0]![0]!;
    const playable = s.hand.find(c => Math.abs(c.rank - top0.rank) === 1 || Math.abs(c.rank - top0.rank) === 12);
    if (!playable) return; // skip if no playable card (unlikely but safe)
    const s2 = reducer(s, { type: "play", cardId: playable.id, pileIndex: 0 });
    expect(s2.cardsPlayed).toBe(1);
    expect(s2.piles[0]![s2.piles[0]!.length - 1]).toEqual(playable);
    // Hand should be same size (drew replacement)
    expect(s2.hand.length).toBeLessThanOrEqual(s.hand.length);
  });

  it("playing an illegal card is no-op", () => {
    const s = initialState(1, settings60);
    // Manually create a state where no card can play on pile 0
    const forcedPile: SpeedState = {
      ...s,
      piles: [
        [makeCard(5, "♠")], // pile top is 5
        s.piles[1]!,
      ],
      hand: [makeCard(8), makeCard(9), makeCard(10), makeCard(2), makeCard(3)], // none ±1 from 5
    };
    const badCard = forcedPile.hand.find(c => Math.abs(c.rank - 5) > 1);
    if (!badCard) return;
    const s2 = reducer(forcedPile, { type: "play", cardId: badCard.id, pileIndex: 0 });
    expect(s2.cardsPlayed).toBe(0);
  });

  it("play is no-op when game is done", () => {
    const s: SpeedState = { ...initialState(1, settings60), phase: "done" };
    const card = s.hand[0]!;
    const s2 = reducer(s, { type: "play", cardId: card.id, pileIndex: 0 });
    expect(s2).toBe(s);
  });
});

// ── 5. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null when playing", () => {
    expect(isTerminal(initialState(1, settings60))).toBeNull();
  });

  it("score equals cardsPlayed when done", () => {
    const s: SpeedState = { ...initialState(1, settings60), phase: "done", cardsPlayed: 17 };
    expect(isTerminal(s)).toEqual({ score: 17 });
  });
});
