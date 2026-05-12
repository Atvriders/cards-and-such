import { describe, it, expect } from "vitest";
import { diceSnakeLadderPlugin } from "./index.js";
import type { DiceSnakeLadderState } from "./state.js";

const S = { dummy: false };

describe("dice-snake-ladder plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSnakeLadderPlugin.id).toBe("dice-snake-ladder");
    expect(diceSnakeLadderPlugin.title).toBe("Dice Snake & Ladder");
    expect(diceSnakeLadderPlugin.category).toBe("dice");
    expect(diceSnakeLadderPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSnakeLadderPlugin.description).toBe("string");
    expect(diceSnakeLadderPlugin.description.length).toBeGreaterThan(0);
    expect(diceSnakeLadderPlugin.settings).toBeDefined();
    expect(typeof diceSnakeLadderPlugin.settings).toBe("object");
    expect(typeof diceSnakeLadderPlugin.initialState).toBe("function");
    expect(typeof diceSnakeLadderPlugin.reducer).toBe("function");
    expect(typeof diceSnakeLadderPlugin.isTerminal).toBe("function");
    expect(diceSnakeLadderPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceSnakeLadderPlugin.initialState(42, S);
    const b = diceSnakeLadderPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.pos).toBe(0);
    expect(a.rolls).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.lastRoll).toBeNull();
    expect(diceSnakeLadderPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling and null when the game is over", () => {
    expect(typeof diceSnakeLadderPlugin.hint).toBe("function");
    const state = diceSnakeLadderPlugin.initialState(5, S);
    const result = diceSnakeLadderPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-snake-ladder-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the gameover branch via the `gameOver` boolean the hint checks.
    const done = { ...state, gameOver: true } as DiceSnakeLadderState & { gameOver: boolean };
    expect(diceSnakeLadderPlugin.hint!(done)).toBeNull();
  });
});
