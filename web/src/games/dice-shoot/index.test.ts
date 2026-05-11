import { describe, it, expect } from "vitest";
import { diceShootPlugin } from "./index.js";
import type { DiceShootState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-shoot plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceShootPlugin.id).toBe("dice-shoot");
    expect(diceShootPlugin.title).toBe("Dice Shoot");
    expect(diceShootPlugin.category).toBe("dice");
    expect(diceShootPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceShootPlugin.description).toBe("string");
    expect(diceShootPlugin.description.length).toBeGreaterThan(0);
    expect(diceShootPlugin.settings).toBeDefined();
    expect(typeof diceShootPlugin.settings).toBe("object");
    expect(typeof diceShootPlugin.initialState).toBe("function");
    expect(typeof diceShootPlugin.reducer).toBe("function");
    expect(typeof diceShootPlugin.isTerminal).toBe("function");
    expect(diceShootPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceShootPlugin.initialState(42, S);
    const b = diceShootPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.target).toBeNull();
    expect(a.roll).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("set-target");
    expect(a.lastWin).toBe(false);
    expect(diceShootPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when active and null when phase is done", () => {
    expect(typeof diceShootPlugin.hint).toBe("function");
    const state = diceShootPlugin.initialState(5, S);
    const result = diceShootPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-shoot-action"]');
      expect(result.pulses).toBe(3);
    }

    const finished: DiceShootState = { ...state, phase: "done" };
    expect(diceShootPlugin.hint!(finished)).toBeNull();
    expect(diceShootPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
