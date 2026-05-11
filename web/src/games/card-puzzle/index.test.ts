import { describe, it, expect } from "vitest";
import { cardPuzzlePlugin } from "./index.js";
import type { CardPuzzleState } from "./state.js";

const S = { dummy: false };

describe("card-puzzle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPuzzlePlugin.id).toBe("card-puzzle");
    expect(cardPuzzlePlugin.title).toBe("Card Puzzle");
    expect(cardPuzzlePlugin.category).toBe("cards");
    expect(cardPuzzlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPuzzlePlugin.description).toBe("string");
    expect(cardPuzzlePlugin.description.length).toBeGreaterThan(0);
    expect(cardPuzzlePlugin.settings).toBeDefined();
    expect(typeof cardPuzzlePlugin.initialState).toBe("function");
    expect(typeof cardPuzzlePlugin.reducer).toBe("function");
    expect(typeof cardPuzzlePlugin.isTerminal).toBe("function");
    expect(cardPuzzlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardPuzzlePlugin.initialState(42, S);
    const b = cardPuzzlePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(a.lastWin).toBe(false);
    expect(a.lastPts).toBe(0);
    expect(a.rngSeed).toBe(42);
    expect(cardPuzzlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when the game is done", () => {
    expect(typeof cardPuzzlePlugin.hint).toBe("function");
    const state = cardPuzzlePlugin.initialState(7, S);
    const result = cardPuzzlePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector).toBe('[data-testid="hint-target-card-puzzle-primary"]');
    expect(result!.pulses).toBe(3);

    const done: CardPuzzleState = { ...state, phase: "done" };
    expect(cardPuzzlePlugin.hint!(done)).toBeNull();
  });
});
