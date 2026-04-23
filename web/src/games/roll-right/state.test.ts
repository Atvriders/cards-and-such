import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, GOAL, NUM_DICE } from "./state.js";

const settings = { dummy: true };

describe("RollRight initialState", () => {
  it("starts at zero scores", () => {
    const s = initialState(1, settings);
    expect(s.scores).toEqual([0, 0]);
    expect(s.currentPlayer).toBe(0);
    expect(s.phase).toBe("select");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for the same seed", () => {
    expect(initialState(42, settings)).toEqual(initialState(42, settings));
  });
});

describe("RollRight roll action", () => {
  it("roll sets all 5 dice to valid face values", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(NUM_DICE);
    s2.dice.forEach((v) => { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(6); });
    expect(s2.rollsThisTurn).toBe(1);
  });

  it("roll is ignored when it's the bot's turn", () => {
    const s = initialState(1, settings);
    // Force bot's turn
    const botTurn = { ...s, currentPlayer: 1 as const };
    const s2 = reducer(botTurn, { type: "roll" });
    expect(s2).toEqual(botTurn);
  });
});

describe("RollRight toggleKeep", () => {
  it("marks a die as kept", () => {
    const s = initialState(3, settings);
    const rolled = reducer(s, { type: "roll" });
    const kept = reducer(rolled, { type: "toggleKeep", index: 0 });
    expect(kept.kept[0]).toBe(true);
  });

  it("toggles kept back off", () => {
    const s = initialState(3, settings);
    const rolled = reducer(s, { type: "roll" });
    const kept = reducer(rolled, { type: "toggleKeep", index: 2 });
    const unkept = reducer(kept, { type: "toggleKeep", index: 2 });
    expect(unkept.kept[2]).toBe(false);
  });
});

describe("RollRight score action", () => {
  it("score increases player 0 total and switches to bot", () => {
    const s = initialState(7, settings);
    const rolled = reducer(s, { type: "roll" });
    const scored = reducer(rolled, { type: "score" });
    expect(scored.scores[0]).toBeGreaterThan(0);
    expect(scored.phase).toBe("scored");
    expect(scored.currentPlayer).toBe(1);
  });

  it("score is ignored before rolling", () => {
    const s = initialState(7, settings);
    const s2 = reducer(s, { type: "score" });
    expect(s2).toEqual(s);
  });
});

describe("RollRight terminal", () => {
  it("isTerminal returns null while game is ongoing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns positive score when player 0 wins", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 0, scores: [GOAL, 0] as unknown as readonly number[] };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns 0 score when bot wins", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 1, scores: [10, GOAL] as unknown as readonly number[] };
    expect(isTerminal(won)!.score).toBe(0);
  });
});
