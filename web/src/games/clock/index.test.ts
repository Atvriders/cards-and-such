import { describe, it, expect } from "vitest";
import { clockPlugin } from "./index.js";
import type { ClockState } from "./state.js";

const S = {} as never;

describe("clock plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(clockPlugin.id).toBe("clock");
    expect(clockPlugin.title).toBe("Clock Solitaire");
    expect(clockPlugin.category).toBe("solitaire");
    expect(clockPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clockPlugin.description).toBe("string");
    expect(clockPlugin.description.length).toBeGreaterThan(0);
    expect(clockPlugin.settings).toBeDefined();
    expect(typeof clockPlugin.settings).toBe("object");
    expect(typeof clockPlugin.initialState).toBe("function");
    expect(typeof clockPlugin.reducer).toBe("function");
    expect(typeof clockPlugin.isTerminal).toBe("function");
    expect(clockPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = clockPlugin.initialState(42, S);
    const b = clockPlugin.initialState(42, S);
    // 13 piles of 4 cards each, all face-down, starting at center pile.
    expect(a.piles.length).toBe(13);
    for (const pile of a.piles) {
      expect(pile.cards.length).toBe(4);
      expect(pile.faceUpCount).toBe(0);
    }
    expect(a.currentPileIndex).toBe(12);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);
    expect(a.gameOver).toBe(false);

    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(clockPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for a fresh deal and null in terminal/exhausted states", () => {
    expect(typeof clockPlugin.hint).toBe("function");
    const state = clockPlugin.initialState(7, S);
    const result = clockPlugin.hint!(state);
    // Fresh deal: current pile (center) has all 4 face-down cards, so we expect a target.
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-clock-pile-\d+"\]$/);
      expect(result.selector).toContain(`pile-${state.currentPileIndex}`);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // won → null
    expect(clockPlugin.hint!({ ...state, won: true })).toBeNull();
    // gameOver → null
    expect(clockPlugin.hint!({ ...state, gameOver: true })).toBeNull();

    // All cards in current pile face-up → null (no face-down to flip).
    const exhausted: ClockState = {
      ...state,
      piles: state.piles.map((p, idx) =>
        idx === state.currentPileIndex
          ? { ...p, faceUpCount: p.cards.length }
          : { ...p, cards: [...p.cards] },
      ),
    };
    expect(clockPlugin.hint!(exhausted)).toBeNull();
  });
});
