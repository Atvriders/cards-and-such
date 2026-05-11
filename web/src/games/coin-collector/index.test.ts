import { describe, it, expect } from "vitest";
import { coinCollectorPlugin } from "./index.js";
import type { CoinCollectorSettings } from "./state.js";

const defaultSettings: CoinCollectorSettings = { gridSize: "7", turnLimit: "30" };

describe("coin-collector plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coinCollectorPlugin.id).toBe("coin-collector");
    expect(coinCollectorPlugin.title).toBe("Coin Collector");
    expect(coinCollectorPlugin.category).toBe("board");
    expect(coinCollectorPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coinCollectorPlugin.description).toBe("string");
    expect(coinCollectorPlugin.description.length).toBeGreaterThan(0);
    expect(coinCollectorPlugin.settings).toBeDefined();
    expect(typeof coinCollectorPlugin.settings).toBe("object");
    expect(typeof coinCollectorPlugin.initialState).toBe("function");
    expect(typeof coinCollectorPlugin.reducer).toBe("function");
    expect(typeof coinCollectorPlugin.isTerminal).toBe("function");
    expect(coinCollectorPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh board", () => {
    const a = coinCollectorPlugin.initialState(42, defaultSettings);
    const b = coinCollectorPlugin.initialState(42, defaultSettings);
    expect(a.gridSize).toBe(7);
    expect(a.grid.length).toBe(49);
    expect(a.playerRow).toBe(0);
    expect(a.playerCol).toBe(0);
    expect(a.score).toBe(0);
    expect(a.coinsCollected).toBe(0);
    expect(a.turnsLeft).toBe(30);
    expect(a.gameOver).toBe(false);
    expect(a.won).toBe(false);
    expect(a.totalCoins).toBeGreaterThan(0);
    // Determinism: same seed -> identical grid layout
    expect(a.grid).toEqual(b.grid);
    expect(a.totalCoins).toBe(b.totalCoins);
    // Player start cell is always empty
    expect(a.grid[0]).toBeNull();
    expect(coinCollectorPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on an active game and null once the game is over", () => {
    expect(typeof coinCollectorPlugin.hint).toBe("function");
    const state = coinCollectorPlugin.initialState(7, defaultSettings);
    const active = coinCollectorPlugin.hint!(state);
    expect(active).not.toBeNull();
    if (active !== null) {
      expect(typeof active.selector).toBe("string");
      expect(active.selector.length).toBeGreaterThan(0);
      if (active.pulses !== undefined) {
        expect(typeof active.pulses).toBe("number");
        expect(active.pulses).toBeGreaterThan(0);
      }
    }

    // Force the game-over branch -> hint should return null.
    const finished = { ...state, gameOver: true };
    expect(coinCollectorPlugin.hint!(finished)).toBeNull();

    // Terminal scoring path: gameOver + won -> includes +100 bonus.
    const wonState = { ...state, gameOver: true, won: true, score: 50 };
    const terminal = coinCollectorPlugin.isTerminal(wonState);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(150);
  });
});
