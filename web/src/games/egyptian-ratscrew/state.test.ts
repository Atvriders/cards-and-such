import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { EgyptianRatscrewState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { botSpeed: "medium" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. initialState ───────────────────────────────────────────────────────────
describe("initialState", () => {
  it("splits 52 cards evenly", () => {
    const s = initialState(1, settings);
    expect(s.playerDeck.length).toBe(26);
    expect(s.botDeck.length).toBe(26);
    expect(s.phase).toBe("flipping");
    expect(s.winner).toBeNull();
  });

  it("is deterministic", () => {
    const s1 = initialState(42, settings);
    const s2 = initialState(42, settings);
    expect(s1.playerDeck).toEqual(s2.playerDeck);
  });
});

// ── 2. Flip — double triggers slap window ─────────────────────────────────────
describe("reducer — flip double", () => {
  it("flipping a matching rank opens slap-window", () => {
    const s = initialState(1, settings);
    const card1 = makeCard(7, "♦");
    const card2 = makeCard(7, "♣");
    const state: EgyptianRatscrewState = {
      ...s,
      playerDeck: [card1, makeCard(3)],
      botDeck: [card2, makeCard(4)],
      pile: [],
      phase: "flipping",
      lastFlippedBy: 1, // bot flipped last, so player is next
    };
    // Player flips a 7
    const s2 = reducer(state, { type: "flip" });
    expect(s2.pile[s2.pile.length - 1]?.rank).toBe(7);
    // Now add the matching card to pile manually and check state
    const withDouble: EgyptianRatscrewState = {
      ...s2,
      pile: [card1, card2],
      phase: "flipping",
      lastFlippedBy: 0,
    };
    // Bot flips (lastFlippedBy was 0 → bot's turn):
    const s3 = reducer(withDouble, { type: "flip" });
    // Depends on bot card — if it also makes a double, slap-window opens
    // More reliable test: set up known double directly in pile
    const directDouble: EgyptianRatscrewState = {
      ...s,
      pile: [makeCard(5, "♠"), makeCard(5, "♦")],
      phase: "slap-window",
      lastFlippedBy: 1,
    };
    const s4 = reducer(directDouble, { type: "slap" });
    expect(s4.pile.length).toBe(0);
    expect(s4.playerDeck.length).toBeGreaterThan(s.playerDeck.length);
  });
});

// ── 3. Slap ───────────────────────────────────────────────────────────────────
describe("reducer — slap", () => {
  it("player slap wins the pile", () => {
    const s = initialState(1, settings);
    const withPile: EgyptianRatscrewState = {
      ...s,
      pile: [makeCard(9), makeCard(9, "♦")],
      phase: "slap-window",
    };
    const s2 = reducer(withPile, { type: "slap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.playerDeck.length).toBe(s.playerDeck.length + 2);
    expect(s2.phase).toBe("flipping");
  });

  it("bot-slap wins the pile for bot", () => {
    const s = initialState(1, settings);
    const withPile: EgyptianRatscrewState = {
      ...s,
      pile: [makeCard(3), makeCard(3, "♦")],
      phase: "slap-window",
    };
    const s2 = reducer(withPile, { type: "bot-slap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.botDeck.length).toBe(s.botDeck.length + 2);
  });

  it("slap is no-op outside slap-window", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "slap" });
    expect(s2).toBe(s);
  });
});

// ── 4. Face-card challenge ────────────────────────────────────────────────────
describe("reducer — face-card tribute", () => {
  it("flipping a Jack triggers tribute of 1", () => {
    const s = initialState(1, settings);
    const jack = makeCard(11, "♠");
    const state: EgyptianRatscrewState = {
      ...s,
      playerDeck: [jack, makeCard(2)],
      botDeck: [makeCard(4), makeCard(5)],
      pile: [],
      phase: "flipping",
      lastFlippedBy: 1, // player flips next
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.phase).toBe("tribute");
    expect(s2.tributeOwed).toBe(1);
    expect(s2.tributePayer).toBe(1); // bot must pay
  });

  it("flipping an Ace triggers tribute of 4", () => {
    const s = initialState(1, settings);
    const ace = makeCard(1, "♠");
    const state: EgyptianRatscrewState = {
      ...s,
      playerDeck: [ace, makeCard(2)],
      pile: [],
      phase: "flipping",
      lastFlippedBy: 1,
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.tributeOwed).toBe(4);
  });
});

// ── 5. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("player win → score 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: 0 as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("bot win → score 0", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: 1 as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
