import { describe, it, expect } from "vitest";
import { diceQuadBetPlugin } from "./index.js";
import type { DiceQuadBetState } from "./state.js";

const S = { rounds: "8" } as const;

describe("dice-quad-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceQuadBetPlugin.id).toBe("dice-quad-bet");
    expect(diceQuadBetPlugin.title).toBe("Dice Quad Bet");
    expect(diceQuadBetPlugin.category).toBe("dice");
    expect(diceQuadBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceQuadBetPlugin.description).toBe("string");
    expect(diceQuadBetPlugin.description.length).toBeGreaterThan(0);
    expect(diceQuadBetPlugin.settings).toBeDefined();
    expect(typeof diceQuadBetPlugin.settings).toBe("object");
    expect(typeof diceQuadBetPlugin.initialState).toBe("function");
    expect(typeof diceQuadBetPlugin.reducer).toBe("function");
    expect(typeof diceQuadBetPlugin.isTerminal).toBe("function");
    expect(diceQuadBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceQuadBetPlugin.initialState(42, S);
    const b = diceQuadBetPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("betting");
    expect(a.coins).toBe(100);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(8);
    expect(a.dice).toEqual([1, 1, 1]);
    expect(diceQuadBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while active, and null once gameover", () => {
    expect(typeof diceQuadBetPlugin.hint).toBe("function");
    const state = diceQuadBetPlugin.initialState(5, S);
    const result = diceQuadBetPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-quad-bet-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: DiceQuadBetState = { ...state, phase: "gameover" };
    expect(diceQuadBetPlugin.hint!(finished)).toBeNull();
    expect(diceQuadBetPlugin.isTerminal(finished)).toEqual({ score: finished.coins });
  });
});
