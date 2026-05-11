import { describe, it, expect } from "vitest";
import { cantaloopSoloPlugin } from "./index.js";
import type { CantaloopSoloState } from "./state.js";

const S = { rounds: "10" } as const;

describe("cantaloop-solo plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cantaloopSoloPlugin.id).toBe("cantaloop-solo");
    expect(cantaloopSoloPlugin.title).toBe("Cantaloop Solo");
    expect(cantaloopSoloPlugin.category).toBe("solitaire");
    expect(cantaloopSoloPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cantaloopSoloPlugin.description).toBe("string");
    expect(cantaloopSoloPlugin.description.length).toBeGreaterThan(0);
    expect(cantaloopSoloPlugin.settings).toBeDefined();
    expect(typeof cantaloopSoloPlugin.settings).toBe("object");
    expect(typeof cantaloopSoloPlugin.initialState).toBe("function");
    expect(typeof cantaloopSoloPlugin.reducer).toBe("function");
    expect(typeof cantaloopSoloPlugin.isTerminal).toBe("function");
    expect(cantaloopSoloPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cantaloopSoloPlugin.initialState(42, S);
    const b = cantaloopSoloPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42 >>> 0);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.hand).toEqual([]);
    expect(a.lastGain).toBe(0);
    expect(a.phase).toBe("ready");
    expect(cantaloopSoloPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not terminal and null when the game is over", () => {
    expect(typeof cantaloopSoloPlugin.hint).toBe("function");
    const state = cantaloopSoloPlugin.initialState(5, S);
    const result = cantaloopSoloPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="play-restart-btn"]');
      expect(result.pulses).toBe(3);
    }

    const gameover: CantaloopSoloState = { ...state, phase: "gameover" };
    expect(cantaloopSoloPlugin.isTerminal(gameover)).toEqual({ score: gameover.score });
    expect(cantaloopSoloPlugin.hint!(gameover)).toBeNull();
  });
});
