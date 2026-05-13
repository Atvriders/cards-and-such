import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CodenamesFullState } from "./state.js";

describe("codenames-full initialState", () => {
  it("creates a 25-tile board", () => {
    const s = initialState(42);
    expect(s.tiles).toHaveLength(25);
  });

  it("uses the canonical type distribution (9 red, 8 blue, 7 bystander, 1 assassin)", () => {
    const s = initialState(42);
    expect(s.tiles.filter(t => t.type === "red")).toHaveLength(9);
    expect(s.tiles.filter(t => t.type === "blue")).toHaveLength(8);
    expect(s.tiles.filter(t => t.type === "bystander")).toHaveLength(7);
    expect(s.tiles.filter(t => t.type === "assassin")).toHaveLength(1);
  });

  it("draws 25 unique words", () => {
    const s = initialState(11);
    const set = new Set(s.tiles.map(t => t.word));
    expect(set.size).toBe(25);
  });

  it("is deterministic by seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.tiles.map(t => `${t.word}:${t.type}`)).toEqual(s2.tiles.map(t => `${t.word}:${t.type}`));
    expect(s1.clue?.word).toBe(s2.clue?.word);
    expect(s1.clue?.count).toBe(s2.clue?.count);
  });

  it("starts on red's turn with a red clue", () => {
    const s = initialState(99);
    expect(s.turn).toBe("red");
    expect(s.clue?.team).toBe("red");
    expect(s.guessesLeft).toBe((s.clue?.count ?? 0) + 1);
  });

  it("reports no terminal score on a fresh board", () => {
    expect(isTerminal(initialState(3))).toBeNull();
  });
});

describe("codenames-full reducer", () => {
  it("reveals a red tile and decrements redLeft when red guesses red", () => {
    const s = initialState(10);
    const redIdx = s.tiles.findIndex(t => t.type === "red");
    const s2 = reducer(s, { type: "guess", tileIndex: redIdx });
    expect(s2.tiles[redIdx]!.revealed).toBe(true);
    expect(s2.redLeft).toBe(s.redLeft - 1);
    // Still red's turn after a correct guess.
    expect(s2.turn).toBe("red");
  });

  it("ends turn when red hits a bystander", () => {
    const s = initialState(20);
    const byIdx = s.tiles.findIndex(t => t.type === "bystander");
    const s2 = reducer(s, { type: "guess", tileIndex: byIdx });
    expect(s2.tiles[byIdx]!.revealed).toBe(true);
    expect(s2.turn).toBe("blue");
  });

  it("ends turn when red hits a blue tile and gives blue the credit", () => {
    const s = initialState(30);
    const blueIdx = s.tiles.findIndex(t => t.type === "blue");
    const before = s.blueLeft;
    const s2 = reducer(s, { type: "guess", tileIndex: blueIdx });
    expect(s2.blueLeft).toBe(before - 1);
    expect(s2.turn).toBe("blue");
  });

  it("hitting the assassin ends the game (blue wins; player score 0)", () => {
    const s = initialState(15);
    const asIdx = s.tiles.findIndex(t => t.type === "assassin");
    const s2 = reducer(s, { type: "guess", tileIndex: asIdx });
    expect(s2.winner).toBe("blue");
    expect(s2.endedByAssassin).toBe("red");
    expect(isTerminal(s2)).toEqual({ score: 0 });
  });

  it("ignores guesses on already-revealed tiles (returns same reference)", () => {
    const s = initialState(20);
    const redIdx = s.tiles.findIndex(t => t.type === "red");
    const s2 = reducer(s, { type: "guess", tileIndex: redIdx });
    const s3 = reducer(s2, { type: "guess", tileIndex: redIdx });
    expect(s3).toBe(s2);
  });

  it("ignores out-of-range tile indices", () => {
    const s = initialState(20);
    const s2 = reducer(s, { type: "guess", tileIndex: 999 });
    expect(s2).toBe(s);
  });

  it("endGuessing passes the turn to the other team and issues a new clue", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "endGuessing" });
    expect(s2.turn).toBe("blue");
    expect(s2.clue?.team).toBe("blue");
    expect(s2.log.length).toBeGreaterThan(s.log.length);
  });

  it("cpuStep is a no-op on red's turn", () => {
    const s = initialState(33);
    expect(s.turn).toBe("red");
    const s2 = reducer(s, { type: "cpuStep" });
    expect(s2).toBe(s);
  });

  it("red wins when redLeft reaches zero (player scores 100)", () => {
    let s = initialState(7);
    // Force a play-through: reveal every red tile in sequence.
    const redIndices = s.tiles
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.type === "red")
      .map(({ i }) => i);
    for (const i of redIndices) {
      // Reset guessesLeft so we can chain reveals without forced turn-ends.
      s = { ...s, guessesLeft: 5 };
      s = reducer(s, { type: "guess", tileIndex: i });
      if (s.winner !== null) break;
    }
    expect(s.winner).toBe("red");
    expect(s.redLeft).toBe(0);
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("no further moves after game ends", () => {
    const s = initialState(15);
    const asIdx = s.tiles.findIndex(t => t.type === "assassin");
    const ended = reducer(s, { type: "guess", tileIndex: asIdx });
    const redIdx = ended.tiles.findIndex(t => t.type === "red" && !t.revealed);
    const after = reducer(ended, { type: "guess", tileIndex: redIdx });
    expect(after).toBe(ended);
  });
});

describe("codenames-full isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score 100 for a red win", () => {
    const s: CodenamesFullState = { ...initialState(1), winner: "red" };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns score 0 for a blue win", () => {
    const s: CodenamesFullState = { ...initialState(1), winner: "blue" };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
