import { describe, it, expect } from "vitest";
import { diceHarvestPlugin } from "./index.js";
import type { DiceHarvestState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-harvest plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceHarvestPlugin.id).toBe("dice-harvest");
    expect(diceHarvestPlugin.title).toBe("Dice Harvest");
    expect(diceHarvestPlugin.category).toBe("dice");
    expect(diceHarvestPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceHarvestPlugin.description).toBe("string");
    expect(diceHarvestPlugin.description.length).toBeGreaterThan(0);
    expect(diceHarvestPlugin.settings).toBeDefined();
    expect(typeof diceHarvestPlugin.settings).toBe("object");
    expect(typeof diceHarvestPlugin.initialState).toBe("function");
    expect(typeof diceHarvestPlugin.reducer).toBe("function");
    expect(typeof diceHarvestPlugin.isTerminal).toBe("function");
    expect(diceHarvestPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceHarvestPlugin.initialState(42, S);
    const b = diceHarvestPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.season).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("plant");
    expect(a.fields.length).toBeGreaterThan(0);
    expect(a.fields.every((f) => f === null)).toBe(true);
    expect(a.rolls).toBeNull();
    expect(diceHarvestPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with non-empty selector during play, and null when game is over", () => {
    expect(typeof diceHarvestPlugin.hint).toBe("function");
    const state = diceHarvestPlugin.initialState(7, S);
    const result = diceHarvestPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-harvest-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the game is over (per the plugin's hint guard), hint must be null.
    const gameover = { ...state, gameOver: true } as unknown as DiceHarvestState;
    expect(diceHarvestPlugin.hint!(gameover)).toBeNull();
    const finished: DiceHarvestState = { ...state, phase: "done" };
    expect(diceHarvestPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
