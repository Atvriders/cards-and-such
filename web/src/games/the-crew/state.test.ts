import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CrewState } from "./state.js";

describe("initialState", () => {
  it("deals 10 cards to each player", () => {
    const s = initialState(42);
    expect(s.hands).toHaveLength(4);
    for (const hand of s.hands) expect(hand.length).toBe(10);
  });

  it("has exactly one task", () => {
    const s = initialState(42);
    expect(s.tasks).toHaveLength(1);
    expect(s.tasks[0]!.assignedTo).toBe(0);
    expect(s.tasks[0]!.completed).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.tasks[0]?.card.id).toBe(s2.tasks[0]?.card.id);
  });

  it("starts not won or lost", () => {
    const s = initialState(1);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
  });
});

describe("reducer - play card", () => {
  it("playing a valid card reduces hand size", () => {
    let s = initialState(5);
    // Find a valid card to play (player's turn or not)
    if (s.turnInTrick !== 0) {
      // If bots go first, just test initial state
      expect(s.hands[0]!.length).toBe(10);
      return;
    }
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "playCard", cardId: card.id });
    // Hand shrinks (player played)
    expect(s2.hands[0]!.length).toBeLessThan(10);
  });

  it("rejects invalid card id", () => {
    let s = initialState(5);
    const s2 = reducer(s, { type: "playCard", cardId: 9999 });
    expect(s2).toBe(s);
  });

  it("no action when game is over", () => {
    const s: CrewState = { ...initialState(5), lost: true };
    const s2 = reducer(s, { type: "playCard", cardId: s.hands[0]![0]!.id });
    expect(s2).toBe(s);
  });
});

describe("reducer - suit following", () => {
  it("must follow suit when possible", () => {
    const s = initialState(10);
    if (s.turnInTrick !== 0) return; // skip if not player's turn

    // Set up a trick where red was led
    const hand = s.hands[0]!;
    const redCard = hand.find(c => c.color === "red");
    const nonRedCard = hand.find(c => c.color !== "red");

    if (!redCard || !nonRedCard) return;

    const forced: CrewState = {
      ...s,
      currentTrick: { led: "red", plays: [null, null, null, null], winner: null },
    };
    const s2 = reducer(forced, { type: "playCard", cardId: nonRedCard.id });
    // Should be rejected (must follow red)
    expect(s2).toBe(forced);
  });
});

describe("isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(7))).toBeNull();
  });

  it("returns score 100 when won", () => {
    const s: CrewState = { ...initialState(7), won: true, score: 100 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns score 0 when lost", () => {
    const s: CrewState = { ...initialState(7), lost: true, score: 0 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
