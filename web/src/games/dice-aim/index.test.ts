import { describe, it, expect } from "vitest";
import { diceAimPlugin } from "./index.js";
import type { DiceAimState } from "./state.js";

const S = { dummy: false };

describe("dice-aim plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceAimPlugin.id).toBe("dice-aim");
    expect(diceAimPlugin.title).toBe("Dice Aim");
    expect(diceAimPlugin.category).toBe("dice");
    expect(diceAimPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceAimPlugin.description).toBe("string");
    expect(diceAimPlugin.description.length).toBeGreaterThan(0);
    expect(diceAimPlugin.settings).toBeDefined();
    expect(typeof diceAimPlugin.settings).toBe("object");
    expect(typeof diceAimPlugin.initialState).toBe("function");
    expect(typeof diceAimPlugin.reducer).toBe("function");
    expect(typeof diceAimPlugin.isTerminal).toBe("function");
    expect(diceAimPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceAimPlugin.initialState(42, S);
    const b = diceAimPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(diceAimPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof diceAimPlugin.hint).toBe("function");
    const state = diceAimPlugin.initialState(7, S);
    const result = diceAimPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-dice-aim-action"]');
    expect(result!.pulses).toBe(3);

    const doneState: DiceAimState = { ...state, phase: "done" };
    expect(diceAimPlugin.hint!(doneState)).toBeNull();
  });
});
