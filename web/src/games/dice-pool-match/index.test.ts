import { describe, it, expect } from "vitest";
import { dicePoolMatchPlugin } from "./index.js";
import type { DicePoolMatchState } from "./state.js";

const S = {} as never;

describe("dice-pool-match plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePoolMatchPlugin.id).toBe("dice-pool-match");
    expect(dicePoolMatchPlugin.title).toBe("Dice Pool Match");
    expect(dicePoolMatchPlugin.category).toBe("dice");
    expect(dicePoolMatchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePoolMatchPlugin.description).toBe("string");
    expect(dicePoolMatchPlugin.description.length).toBeGreaterThan(0);
    expect(dicePoolMatchPlugin.settings).toBeDefined();
    expect(typeof dicePoolMatchPlugin.settings).toBe("object");
    expect(typeof dicePoolMatchPlugin.initialState).toBe("function");
    expect(typeof dicePoolMatchPlugin.reducer).toBe("function");
    expect(typeof dicePoolMatchPlugin.isTerminal).toBe("function");
    expect(dicePoolMatchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = dicePoolMatchPlugin.initialState(42, S) as DicePoolMatchState;
    const b = dicePoolMatchPlugin.initialState(42, S) as DicePoolMatchState;
    expect(a.dice).toEqual(b.dice);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.kept).toEqual([false, false, false, false, false]);
    expect(a.rollsLeft).toBe(2);
    expect(a.round).toBe(1);
    expect(a.target).toBe("threeOfAKind");
    expect(a.roundScore).toBe(0);
    expect(a.totalScore).toBe(0);
    expect(a.gameOver).toBe(false);
    expect(a.dice).toHaveLength(5);
    for (const d of a.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
    expect(dicePoolMatchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once gameOver is true", () => {
    expect(typeof dicePoolMatchPlugin.hint).toBe("function");
    const state = dicePoolMatchPlugin.initialState(7, S) as DicePoolMatchState;
    const result = dicePoolMatchPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-pool-match-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: DicePoolMatchState = { ...state, gameOver: true };
    expect(dicePoolMatchPlugin.hint!(finished)).toBeNull();
  });
});
