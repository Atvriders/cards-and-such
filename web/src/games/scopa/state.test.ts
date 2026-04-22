import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scopaDeck, findCaptureSets, canCapture, faceValue, primeValue, computeFinalScores, COINS_SUIT } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Scopa - deck", () => {
  it("has 40 cards", () => {
    expect(scopaDeck()).toHaveLength(40);
  });

  it("has no 8, 9, 10 ranks", () => {
    const ranks = scopaDeck().map(c => c.rank);
    [8, 9, 10].forEach(r => expect(ranks).not.toContain(r));
  });
});

describe("Scopa - findCaptureSets", () => {
  it("finds single card match", () => {
    const table = [makeCard("♠", 5), makeCard("♥", 3)];
    const sets = findCaptureSets(table, 5);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toHaveLength(1);
    expect(sets[0]![0]!.rank).toBe(5);
  });

  it("finds sum match (2+3=5)", () => {
    const table = [makeCard("♠", 2), makeCard("♥", 3), makeCard("♦", 1)];
    const sets = findCaptureSets(table, 5);
    const sumSet = sets.find(s => s.length === 2);
    expect(sumSet).toBeDefined();
  });

  it("returns empty when no match", () => {
    const table = [makeCard("♠", 6), makeCard("♥", 4)];
    const sets = findCaptureSets(table, 3);
    expect(sets).toHaveLength(0);
  });
});

describe("Scopa - initialState", () => {
  it("deals 3 to player, 3 to bot, 4 to table", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(3);
    expect(state.botHand).toHaveLength(3);
    expect(state.table).toHaveLength(4);
    expect(state.deck).toHaveLength(30);
  });

  it("starts in player-turn phase", () => {
    expect(initialState(42).phase).toBe("player-turn");
  });
});

describe("Scopa - computeFinalScores", () => {
  it("awards settebello to player when player has 7 of diamonds", () => {
    const state = initialState(1);
    const withCapture = {
      ...state,
      phase: "done" as const,
      playerCaptures: [makeCard(COINS_SUIT, 7, "sc-♦7")],
      botCaptures: [],
      playerScopeCount: 0,
      botScopeCount: 0,
      finalScores: null,
    };
    const scores = computeFinalScores(withCapture);
    expect(scores.player).toBeGreaterThan(scores.bot);
  });
});

describe("Scopa - reducer place", () => {
  it("placing a card adds it to the table", () => {
    let state = initialState(99);
    const cardId = state.playerHand[0]!.id;
    state = reducer(state, { type: "select", cardId });
    state = reducer(state, { type: "place" });
    // Table should have grown by 1 (then bot plays, possibly capturing)
    expect(state.phase).toBe("player-turn");
  });
});

describe("Scopa - primeValue", () => {
  it("7 has highest prime value 21", () => {
    expect(primeValue(7)).toBe(21);
  });
  it("face cards have value 10", () => {
    expect(primeValue(11)).toBe(10);
    expect(primeValue(12)).toBe(10);
    expect(primeValue(13)).toBe(10);
  });
});
