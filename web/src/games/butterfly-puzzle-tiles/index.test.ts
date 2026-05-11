import { describe, it, expect } from "vitest";
import { butterflyPuzzleTilesPlugin } from "./index.js";

const S = {} as never;

describe("butterfly-puzzle-tiles plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(butterflyPuzzleTilesPlugin.id).toBe("butterfly-puzzle-tiles");
    expect(butterflyPuzzleTilesPlugin.title).toBe("Butterfly Puzzle Tiles");
    expect(butterflyPuzzleTilesPlugin.category).toBe("solitaire");
    expect(butterflyPuzzleTilesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof butterflyPuzzleTilesPlugin.description).toBe("string");
    expect(butterflyPuzzleTilesPlugin.description.length).toBeGreaterThan(0);
    expect(typeof butterflyPuzzleTilesPlugin.howToPlay).toBe("string");
    expect(butterflyPuzzleTilesPlugin.settings).toBeDefined();
    expect(typeof butterflyPuzzleTilesPlugin.settings).toBe("object");
    expect(typeof butterflyPuzzleTilesPlugin.initialState).toBe("function");
    expect(typeof butterflyPuzzleTilesPlugin.reducer).toBe("function");
    expect(typeof butterflyPuzzleTilesPlugin.isTerminal).toBe("function");
    expect(butterflyPuzzleTilesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = butterflyPuzzleTilesPlugin.initialState(42, S);
    const b = butterflyPuzzleTilesPlugin.initialState(42, S);
    const aIds = a.tiles.map((t) => `${t.id}:${t.face}:${t.pos.row},${t.pos.col},${t.pos.layer}`).join("|");
    const bIds = b.tiles.map((t) => `${t.id}:${t.face}:${t.pos.row},${t.pos.col},${t.pos.layer}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.tiles.length).toBe(72);
    expect(a.selectedId).toBeNull();
    expect(a.removed).toBe(0);
    expect(a.won).toBe(false);
    expect(a.gameOver).toBe(false);
    expect(butterflyPuzzleTilesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh deal and null when the game is terminal", () => {
    expect(typeof butterflyPuzzleTilesPlugin.hint).toBe("function");
    const state = butterflyPuzzleTilesPlugin.initialState(5, S);
    const result = butterflyPuzzleTilesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="play-restart-btn"]');
    expect(result!.pulses).toBe(3);

    // Force terminal state: a won game should make hint() return null via the isTerminal branch.
    const wonState = { ...state, won: true, moves: 10 };
    expect(butterflyPuzzleTilesPlugin.isTerminal(wonState)).not.toBeNull();
    expect(butterflyPuzzleTilesPlugin.hint!(wonState)).toBeNull();
  });
});
