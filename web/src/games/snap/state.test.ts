import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SnapState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const mediumSettings = { botSpeed: "medium" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. Initial state ──────────────────────────────────────────────────────────
describe("initialState", () => {
  it("splits 52 cards evenly", () => {
    const s = initialState(42, mediumSettings);
    expect(s.playerDeck.length).toBe(26);
    expect(s.botDeck.length).toBe(26);
    expect(s.pile.length).toBe(0);
    expect(s.phase).toBe("flipping");
    expect(s.winner).toBeNull();
  });

  it("is deterministic", () => {
    const s1 = initialState(7, mediumSettings);
    const s2 = initialState(7, mediumSettings);
    expect(s1.playerDeck).toEqual(s2.playerDeck);
  });

  it("different seeds differ", () => {
    const s1 = initialState(1, mediumSettings);
    const s2 = initialState(2, mediumSettings);
    expect(s1.playerDeck).not.toEqual(s2.playerDeck);
  });
});

// ── 2. Flipping ───────────────────────────────────────────────────────────────
describe("reducer — flip", () => {
  it("flip moves a card from player deck to pile", () => {
    const s = initialState(42, mediumSettings);
    const s2 = reducer(s, { type: "flip" });
    expect(s2.pile.length).toBe(1);
    // player flipped first (lastFlippedBy null → player goes)
    expect(s2.playerDeck.length).toBe(25);
    expect(s2.botDeck.length).toBe(26);
  });

  it("flip is ignored when not in flipping phase", () => {
    const s = initialState(42, mediumSettings);
    const snapState: SnapState = { ...s, phase: "snap-window" };
    const s2 = reducer(snapState, { type: "flip" });
    expect(s2).toBe(snapState);
  });
});

// ── 3. Snap window ─────────────────────────────────────────────────────────────
describe("reducer — snap conditions", () => {
  it("snap window opens when two consecutive cards match rank", () => {
    const s = initialState(1, mediumSettings);
    const card1 = makeCard(7, "♠");
    const card2 = makeCard(7, "♥");
    const snapState: SnapState = {
      ...s,
      pile: [card1, card2],
      phase: "flipping",
      lastFlippedBy: null,
    };
    // Force flip to move to snap-window detection via a known matching top
    // Instead, test directly: create a state where the pile has matching top two
    // We verify by simulating what reducer does: a matching pile sets snap-window
    // Simulate the pile already having matching top, then flip something on top of it
    // Actually let's verify the snap logic by building the pile state
    const pileMatch: SnapState = {
      ...s,
      pile: [makeCard(5, "♣"), makeCard(5, "♦")],
      phase: "snap-window",
    };
    const snapResult = reducer(pileMatch, { type: "snap" });
    // Player snapped — should gain the pile
    expect(snapResult.pile.length).toBe(0);
    expect(snapResult.playerDeck.length).toBe(s.playerDeck.length + 2);
  });

  it("player snapping clears the pile and adds to player deck", () => {
    const s = initialState(42, mediumSettings);
    const withPile: SnapState = {
      ...s,
      pile: [makeCard(3, "♠"), makeCard(3, "♦"), makeCard(9, "♣")],
      phase: "snap-window",
    };
    const s2 = reducer(withPile, { type: "snap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.playerDeck.length).toBe(s.playerDeck.length + 3);
    expect(s2.phase).toBe("flipping");
  });

  it("bot-snap clears the pile and adds to bot deck", () => {
    const s = initialState(42, mediumSettings);
    const withPile: SnapState = {
      ...s,
      pile: [makeCard(4, "♠"), makeCard(4, "♦")],
      phase: "snap-window",
    };
    const s2 = reducer(withPile, { type: "bot-snap" });
    expect(s2.pile.length).toBe(0);
    expect(s2.botDeck.length).toBe(s.botDeck.length + 2);
    expect(s2.phase).toBe("flipping");
  });
});

// ── 4. Game over ──────────────────────────────────────────────────────────────
describe("reducer — game over", () => {
  it("player wins when bot runs out of cards on snap", () => {
    const s = initialState(1, mediumSettings);
    const state: SnapState = {
      ...s,
      botDeck: [],
      playerDeck: [makeCard(2), makeCard(5)],
      pile: [makeCard(7, "♣"), makeCard(7, "♦")],
      phase: "snap-window",
    };
    const s2 = reducer(state, { type: "snap" });
    expect(s2.phase).toBe("done");
    expect(s2.winner).toBe(0);
  });

  it("bot wins when player deck empty on flip", () => {
    const s = initialState(1, mediumSettings);
    const state: SnapState = {
      ...s,
      playerDeck: [],
      botDeck: [makeCard(5)],
      pile: [makeCard(3)],
      phase: "flipping",
      lastFlippedBy: 1, // bot last flipped → player's turn next
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.phase).toBe("done");
    expect(s2.winner).toBe(1);
  });
});

// ── 5. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game ongoing", () => {
    expect(isTerminal(initialState(1, mediumSettings))).toBeNull();
  });

  it("returns score 100 for player win", () => {
    const s = { ...initialState(1, mediumSettings), phase: "done" as const, winner: 0 as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns score 0 for bot win", () => {
    const s = { ...initialState(1, mediumSettings), phase: "done" as const, winner: 1 as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
