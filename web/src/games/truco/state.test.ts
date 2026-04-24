import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, trucoDeck } from "./state.js";

describe("Truco - deck", () => {
  it("has 40 cards", () => {
    expect(trucoDeck()).toHaveLength(40);
  });

  it("has no ranks 8, 9, or 10", () => {
    const ranks = trucoDeck().map(c => c.rank);
    [8, 9, 10].forEach(r => expect(ranks).not.toContain(r));
  });
});

describe("Truco - initialState", () => {
  it("deals 3 cards to player and 3 to bot", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(3);
    expect(state.botHand).toHaveLength(3);
  });

  it("starts in player-turn phase", () => {
    expect(initialState(42).phase).toBe("player-turn");
  });

  it("starts with zero scores", () => {
    const state = initialState(42);
    expect(state.playerScore).toBe(0);
    expect(state.botScore).toBe(0);
  });
});

describe("Truco - reducer", () => {
  it("playing a card removes it from hand", () => {
    const state = initialState(99);
    const cardId = state.playerHand[0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.playerHand.find(c => c.id === cardId)).toBeUndefined();
  });

  it("playing all 3 cards ends the game", () => {
    let state = initialState(7);
    for (let i = 0; i < 3 && state.phase !== "done"; i++) {
      const cardId = state.playerHand[0]!.id;
      state = reducer(state, { type: "play", cardId });
    }
    expect(state.phase).toBe("done");
    expect(state.finalScores).not.toBeNull();
  });

  it("ignores actions when game is done", () => {
    let state = initialState(11);
    for (let i = 0; i < 3 && state.phase !== "done"; i++) {
      state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
    }
    const doneState = state;
    const after = reducer(doneState, { type: "play", cardId: "any" });
    expect(after).toBe(doneState);
  });
});

describe("Truco - isTerminal", () => {
  it("returns null before game is done", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score object when game is done", () => {
    let state = initialState(5);
    for (let i = 0; i < 3 && state.phase !== "done"; i++) {
      state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
    }
    const result = isTerminal(state);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});
