import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Tarneeb - initialState", () => {
  it("deals 13 cards to each player", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(13);
    expect(state.botHand).toHaveLength(13);
  });

  it("starts in bid phase", () => {
    expect(initialState(42).phase).toBe("bid");
  });

  it("starts with zero tricks won", () => {
    const state = initialState(42);
    expect(state.tricksWon.player).toBe(0);
    expect(state.tricksWon.bot).toBe(0);
  });
});

describe("Tarneeb - bidding", () => {
  it("bidding moves to play phase", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid", tricks: 7, trump: "♠" });
    expect(next.phase).toBe("play");
    expect(next.bid).toBe(7);
    expect(next.trump).toBe("♠");
  });

  it("can bid hearts as trump", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "bid", tricks: 9, trump: "♥" });
    expect(next.trump).toBe("♥");
    expect(next.bid).toBe(9);
  });
});

describe("Tarneeb - playing", () => {
  it("playing a card removes it from hand", () => {
    let state = initialState(99);
    state = reducer(state, { type: "bid", tricks: 7, trump: "♠" });
    const cardId = state.playerHand[0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.playerHand.find(c => c.id === cardId)).toBeUndefined();
  });

  it("game ends after 13 tricks", () => {
    let state = initialState(7);
    state = reducer(state, { type: "bid", tricks: 7, trump: "♠" });
    let iterations = 0;
    while (state.phase !== "done" && iterations < 30) {
      if (state.phase === "play" && state.playerHand.length > 0) {
        state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
      } else break;
      iterations++;
    }
    expect(state.phase).toBe("done");
    expect(state.finalScores).not.toBeNull();
  });
});

describe("Tarneeb - isTerminal", () => {
  it("returns null before done", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when done", () => {
    let state = initialState(5);
    state = reducer(state, { type: "bid", tricks: 7, trump: "♠" });
    let iterations = 0;
    while (state.phase !== "done" && iterations < 30) {
      if (state.phase === "play" && state.playerHand.length > 0) {
        state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
      } else break;
      iterations++;
    }
    const t = isTerminal(state);
    expect(t).not.toBeNull();
    expect(typeof t?.score).toBe("number");
  });
});
