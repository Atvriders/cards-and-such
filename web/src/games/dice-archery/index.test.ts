import { describe, it, expect } from "vitest";
import { diceArcheryPlugin } from "./index.js";
import type { DiceArcheryState } from "./state.js";

describe("dice-archery plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceArcheryPlugin.id).toBe("dice-archery");
    expect(diceArcheryPlugin.title).toBe("Dice Archery");
    expect(diceArcheryPlugin.category).toBe("dice");
    expect(diceArcheryPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceArcheryPlugin.description).toBe("string");
    expect(diceArcheryPlugin.description.length).toBeGreaterThan(0);
    expect(diceArcheryPlugin.settings).toBeDefined();
    expect(typeof diceArcheryPlugin.settings).toBe("object");
    expect(typeof diceArcheryPlugin.initialState).toBe("function");
    expect(typeof diceArcheryPlugin.reducer).toBe("function");
    expect(typeof diceArcheryPlugin.isTerminal).toBe("function");
    expect(diceArcheryPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh range", () => {
    const a = diceArcheryPlugin.initialState(42, {} as never) as DiceArcheryState;
    const b = diceArcheryPlugin.initialState(42, {} as never) as DiceArcheryState;
    expect(a).toEqual(b);
    expect(a.arrowsRemaining).toBe(6);
    expect(a.lastRoll).toBeNull();
    expect(a.lastRing).toBeNull();
    expect(a.score).toBe(0);
    expect(a.gameOver).toBe(false);
    expect(diceArcheryPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when the game is over", () => {
    expect(typeof diceArcheryPlugin.hint).toBe("function");
    const fresh = diceArcheryPlugin.initialState(7, {} as never) as DiceArcheryState;
    const result = diceArcheryPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-archery-shoot"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: DiceArcheryState = { ...fresh, gameOver: true };
    expect(diceArcheryPlugin.hint!(finished)).toBeNull();
  });
});
