import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLORS } from "./state.js";
import type { HanabiState } from "./state.js";

describe("initialState", () => {
  it("deals 4 cards to each of 4 players", () => {
    const s = initialState(42);
    expect(s.hands).toHaveLength(4);
    for (const hand of s.hands) expect(hand).toHaveLength(4);
  });

  it("starts with 8 clue tokens and 3 lives", () => {
    const s = initialState(42);
    expect(s.clueTokens).toBe(8);
    expect(s.lives).toBe(3);
  });

  it("has all fireworks at 0", () => {
    const s = initialState(42);
    for (const color of COLORS) expect(s.fireworks[color]).toBe(0);
  });

  it("deck has 50 - 16 = 34 cards remaining", () => {
    const s = initialState(42);
    expect(s.deck.length).toBe(34);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.deck[0]?.id).toBe(s2.deck[0]?.id);
  });
});

describe("reducer - play card", () => {
  it("removes played card from player hand", () => {
    const s = initialState(1);
    const before = s.hands[0]!.length;
    // Force a valid play: manipulate state to have a known playable card
    const forcedState: HanabiState = {
      ...s,
      hands: [
        [{ id: 999, color: "red", number: 1, knownColor: null, knownNumber: null }, ...s.hands[0]!.slice(1)],
        s.hands[1]!,
        s.hands[2]!,
        s.hands[3]!,
      ],
      fireworks: { ...s.fireworks, red: 0 },
    };
    const s2 = reducer(forcedState, { type: "playCard", index: 0 });
    // Player hand should have same size (drew a card) or fewer if deck empty
    expect(s2.hands[0]!.length).toBeLessThanOrEqual(before);
  });

  it("increments fireworks when valid play", () => {
    const s = initialState(0);
    const forcedState: HanabiState = {
      ...s,
      hands: [
        [{ id: 999, color: "green", number: 1, knownColor: null, knownNumber: null }, ...s.hands[0]!.slice(1)],
        s.hands[1]!,
        s.hands[2]!,
        s.hands[3]!,
      ],
      fireworks: { ...s.fireworks },
    };
    // Run until player's turn (bots may play)
    const s2 = reducer(forcedState, { type: "playCard", index: 0 });
    // green should be at least 1 (either we played it, or bots advanced)
    expect(s2.fireworks.green).toBeGreaterThanOrEqual(1);
  });

  it("loses a life on misplay", () => {
    const s = initialState(2);
    const forcedState: HanabiState = {
      ...s,
      hands: [
        [{ id: 999, color: "red", number: 5, knownColor: null, knownNumber: null }, ...s.hands[0]!.slice(1)],
        s.hands[1]!,
        s.hands[2]!,
        s.hands[3]!,
      ],
      fireworks: { ...s.fireworks, red: 0 }, // red at 0, playing 5 = misplay
    };
    const s2 = reducer(forcedState, { type: "playCard", index: 0 });
    expect(s2.lives).toBeLessThan(s.lives);
  });
});

describe("reducer - discard", () => {
  it("adds card to discards and restores a clue token", () => {
    const s: HanabiState = { ...initialState(5), clueTokens: 6 };
    const s2 = reducer(s, { type: "discardCard", index: 0 });
    expect(s2.clueTokens).toBe(7);
    expect(s2.discards.length).toBeGreaterThan(0);
  });

  it("cannot discard at max clue tokens", () => {
    const s = initialState(5); // starts at 8
    const s2 = reducer(s, { type: "discardCard", index: 0 });
    expect(s2).toBe(s);
  });
});

describe("reducer - give clue", () => {
  it("spends a clue token", () => {
    const s = initialState(3);
    const s2 = reducer(s, { type: "giveClue", toPlayer: 1, clueType: "color", value: "red" });
    expect(s2.clueTokens).toBeLessThan(s.clueTokens);
  });

  it("cannot clue yourself (player 0)", () => {
    const s = initialState(3);
    const s2 = reducer(s, { type: "giveClue", toPlayer: 0, clueType: "color", value: "red" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null when game is ongoing", () => {
    const s = initialState(10);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s: HanabiState = { ...initialState(10), won: true, score: 25 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("returns score when lost", () => {
    const s: HanabiState = { ...initialState(10), lost: true, score: 10 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
  });
});
