import { describe, it, expect } from "vitest";
import { cardFlipPuzzlePlugin } from "./index.js";

describe("cardFlipPuzzlePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardFlipPuzzlePlugin.id).toBe("card-flip-puzzle");
    expect(cardFlipPuzzlePlugin.title).toBe("Card Flip Puzzle");
    expect(cardFlipPuzzlePlugin.category).toBe("cards");
    expect(cardFlipPuzzlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardFlipPuzzlePlugin.description).toBe("string");
    expect(cardFlipPuzzlePlugin.description.length).toBeGreaterThan(0);
    expect(cardFlipPuzzlePlugin.settings).toBeDefined();
    expect(typeof cardFlipPuzzlePlugin.initialState).toBe("function");
    expect(typeof cardFlipPuzzlePlugin.reducer).toBe("function");
    expect(typeof cardFlipPuzzlePlugin.isTerminal).toBe("function");
    expect(typeof cardFlipPuzzlePlugin.hint).toBe("function");
    expect(cardFlipPuzzlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a: any = cardFlipPuzzlePlugin.initialState(42, {} as never);
    const b: any = cardFlipPuzzlePlugin.initialState(42, {} as never);
    const c: any = cardFlipPuzzlePlugin.initialState(43, {} as never);

    // Structural invariants
    expect(a.rngSeed).toBe(42);
    expect(a.cards.length).toBe(16);
    expect(a.revealed.length).toBe(16);
    expect(a.matched.length).toBe(16);
    expect(a.revealed.every((v: boolean) => v === false)).toBe(true);
    expect(a.matched.every((v: boolean) => v === false)).toBe(true);
    expect(a.flipA).toBeNull();
    expect(a.flipB).toBeNull();
    expect(a.moves).toBe(0);
    expect(a.pairsFound).toBe(0);
    expect(a.gameOver).toBe(false);

    // Eight pairs of values 1..8
    const counts = new Map<number, number>();
    for (const v of a.cards as number[]) counts.set(v, (counts.get(v) ?? 0) + 1);
    for (let v = 1; v <= 8; v++) expect(counts.get(v)).toBe(2);

    // Same seed -> identical card layout
    expect(b.cards).toEqual(a.cards);
    // Different seed -> (very likely) different ordering
    expect(c.cards).not.toEqual(a.cards);

    // Not terminal on a fresh state
    expect(cardFlipPuzzlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when gameOver is true", () => {
    const playing: any = cardFlipPuzzlePlugin.initialState(7, {} as never);
    const target = cardFlipPuzzlePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-card-flip-puzzle-grid"]');
    expect(target!.pulses).toBe(3);

    // When game is over, hint must return null
    const finished = { ...playing, gameOver: true };
    expect(cardFlipPuzzlePlugin.hint!(finished)).toBeNull();
  });
});
