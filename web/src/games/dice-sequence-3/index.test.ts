import { describe, it, expect } from "vitest";
import { diceSequence3Plugin } from "./index.js";
import type { DiceSequence3State } from "./state.js";

const S = { rounds: "10" as const };

describe("dice-sequence-3 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSequence3Plugin.id).toBe("dice-sequence-3");
    expect(diceSequence3Plugin.title).toBe("Dice Sequence 3");
    expect(diceSequence3Plugin.category).toBe("dice");
    expect(diceSequence3Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSequence3Plugin.description).toBe("string");
    expect(diceSequence3Plugin.description.length).toBeGreaterThan(0);
    expect(diceSequence3Plugin.settings).toBeDefined();
    expect(typeof diceSequence3Plugin.settings).toBe("object");
    expect(typeof diceSequence3Plugin.initialState).toBe("function");
    expect(typeof diceSequence3Plugin.reducer).toBe("function");
    expect(typeof diceSequence3Plugin.isTerminal).toBe("function");
    expect(diceSequence3Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceSequence3Plugin.initialState(123, S);
    const b = diceSequence3Plugin.initialState(123, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.dice.length).toBe(3);
    a.dice.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.totalRounds).toBe(10);
    expect(a.phase).toBe("playing");
    expect(diceSequence3Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    expect(typeof diceSequence3Plugin.hint).toBe("function");
    const state = diceSequence3Plugin.initialState(7, S);
    const result = diceSequence3Plugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-sequence-3-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: DiceSequence3State = { ...state, phase: "gameover" };
    expect(diceSequence3Plugin.hint!(finished)).toBeNull();
    expect(diceSequence3Plugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
