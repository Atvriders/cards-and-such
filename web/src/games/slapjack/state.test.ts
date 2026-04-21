import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SlapjackState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { botSpeed: "medium" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. Initial state ──────────────────────────────────────────────────────────
describe("initialState", () => {
  it("splits 52 cards evenly and phase is flipping", () => {
    const s = initialState(1, settings);
    expect(s.playerDeck.length).toBe(26);
    expect(s.botDeck.length).toBe(26);
    expect(s.pile.length).toBe(0);
    expect(s.phase).toBe("flipping");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(55, settings);
    const s2 = initialState(55, settings);
    expect(s1.playerDeck).toEqual(s2.playerDeck);
  });
});

// ── 2. Flipping ───────────────────────────────────────────────────────────────
describe("reducer — flip", () => {
  it("flip moves top card from player deck to pile", () => {
    const s = initialState(1, settings);
    const topCard = s.playerDeck[0]!;
    const s2 = reducer(s, { type: "flip" });
    expect(s2.pile[0]).toEqual(topCard);
    expect(s2.playerDeck.length).toBe(25);
  });

  it("flip is no-op when phase is not flipping", () => {
    const s: SlapjackState = { ...initialState(1, settings), phase: "slap-window" };
    const s2 = reducer(s, { type: "flip" });
    expect(s2).toBe(s);
  });

  it("flipping a Jack opens slap-window", () => {
    const s = initialState(1, settings);
    const jack = makeCard(11, "♥");
    const state: SlapjackState = {
      ...s,
      playerDeck: [jack, makeCard(2)],
      phase: "flipping",
      lastFlippedBy: null,
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.phase).toBe("slap-window");
    expect(s2.pile[s2.pile.length - 1]?.rank).toBe(11);
  });
});

// ── 3. Slap ───────────────────────────────────────────────────────────────────
describe("reducer — slap / bot-slap", () => {
  it("player slap wins the pile", () => {
    const s = initialState(1, settings);
    const state: SlapjackState = {
      ...s,
      pile: [makeCard(11, "♦"), makeCard(5)],
      phase: "slap-window",
    };
    const s2 = reducer(state, { type: "slap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.playerDeck.length).toBe(s.playerDeck.length + 2);
    expect(s2.phase).toBe("flipping");
  });

  it("bot-slap wins the pile for bot", () => {
    const s = initialState(1, settings);
    const state: SlapjackState = {
      ...s,
      pile: [makeCard(11, "♣"), makeCard(3)],
      phase: "slap-window",
    };
    const s2 = reducer(state, { type: "bot-slap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.botDeck.length).toBe(s.botDeck.length + 2);
  });

  it("slap is no-op when not in slap-window", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "slap" });
    expect(s2).toBe(s);
  });
});

// ── 4. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null when game ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("score 100 for player win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: 0 as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("score 0 for bot win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: 1 as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("null when phase is done but winner is null", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: null };
    expect(isTerminal(s)).toBeNull();
  });
});
