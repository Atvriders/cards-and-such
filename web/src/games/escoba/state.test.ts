import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, escobaDeck, findCaptureSets, faceValue, TARGET } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `t-${suit}${rank}` };
}

describe("Escoba - deck", () => {
  it("has 40 cards", () => {
    expect(escobaDeck()).toHaveLength(40);
  });

  it("has no ranks 8, 9, 10", () => {
    const ranks = escobaDeck().map(c => c.rank);
    [8, 9, 10].forEach(r => expect(ranks).not.toContain(r));
  });
});

describe("Escoba - faceValue", () => {
  it("Jack = 8, Queen = 9, King = 10", () => {
    expect(faceValue(11)).toBe(8);
    expect(faceValue(12)).toBe(9);
    expect(faceValue(13)).toBe(10);
  });

  it("numbers return their rank", () => {
    expect(faceValue(7)).toBe(7);
    expect(faceValue(1)).toBe(1);
  });
});

describe("Escoba - findCaptureSets", () => {
  it("finds subset summing to target", () => {
    const table = [makeCard("♠", 7), makeCard("♥", 6), makeCard("♦", 2)];
    // 7+6+2=15
    const sets = findCaptureSets(table, 15);
    expect(sets.length).toBeGreaterThan(0);
    expect(sets.some(s => s.length === 3)).toBe(true);
  });

  it("returns empty when no subset sums to target", () => {
    const table = [makeCard("♠", 1), makeCard("♥", 1)];
    const sets = findCaptureSets(table, 15);
    expect(sets).toHaveLength(0);
  });

  it("target is 15", () => {
    expect(TARGET).toBe(15);
  });
});

describe("Escoba - initialState", () => {
  it("deals correctly", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(3);
    expect(state.botHand).toHaveLength(3);
    expect(state.table).toHaveLength(4);
    expect(state.deck).toHaveLength(30);
  });

  it("starts in player-turn", () => {
    expect(initialState(42).phase).toBe("player-turn");
  });
});

describe("Escoba - reducer", () => {
  it("placing a card adds to the table (then bot plays)", () => {
    const state = initialState(99);
    const cardId = state.playerHand[0]!.id;
    const s1 = reducer(state, { type: "select", cardId });
    const s2 = reducer(s1, { type: "place" });
    expect(s2.phase).toBe("player-turn");
  });

  it("game ends after all cards played", () => {
    let state = initialState(3);
    let iterations = 0;
    while (state.phase !== "done" && iterations < 200) {
      const cardId = state.playerHand[0]!.id;
      state = reducer(state, { type: "select", cardId });
      state = reducer(state, { type: "place" });
      iterations++;
    }
    expect(state.phase).toBe("done");
    expect(state.finalScores).not.toBeNull();
  });

  it("returns null from isTerminal before end", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});
