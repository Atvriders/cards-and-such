import { describe, it, expect } from "vitest";
import { diceSpinnerPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("dice-spinner plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSpinnerPlugin.id).toBe("dice-spinner");
    expect(diceSpinnerPlugin.title).toBe("Dice Spinner");
    expect(diceSpinnerPlugin.category).toBe("dice");
    expect(diceSpinnerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSpinnerPlugin.description).toBe("string");
    expect(diceSpinnerPlugin.description.length).toBeGreaterThan(0);
    expect(diceSpinnerPlugin.settings).toBeDefined();
    expect(typeof diceSpinnerPlugin.settings).toBe("object");
    expect(typeof diceSpinnerPlugin.initialState).toBe("function");
    expect(typeof diceSpinnerPlugin.reducer).toBe("function");
    expect(typeof diceSpinnerPlugin.isTerminal).toBe("function");
    expect(diceSpinnerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceSpinnerPlugin.initialState(42, S);
    const b = diceSpinnerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rollNo).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("betting");
    expect(a.lastBet).toBeNull();
    expect(a.lastFace).toBeNull();
    expect(a.lastWin).toBe(false);
    expect(diceSpinnerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof diceSpinnerPlugin.hint).toBe("function");
    const state = diceSpinnerPlugin.initialState(7, S);
    const result = diceSpinnerPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("hint-target-dice-spinner");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When phase is gameover, hint() should return null.
    const done = { ...state, phase: "gameover" as const };
    expect(diceSpinnerPlugin.hint!(done)).toBeNull();
  });
});
