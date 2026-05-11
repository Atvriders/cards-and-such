import { describe, it, expect } from "vitest";
import { diceFrenzyTallPlugin } from "./index.js";
import type { DiceFrenzyTallState } from "./state.js";

const S = { dummy: false };

describe("dice-frenzy-tall plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFrenzyTallPlugin.id).toBe("dice-frenzy-tall");
    expect(diceFrenzyTallPlugin.title).toBe("Dice Frenzy Tall");
    expect(diceFrenzyTallPlugin.category).toBe("dice");
    expect(diceFrenzyTallPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFrenzyTallPlugin.description).toBe("string");
    expect(diceFrenzyTallPlugin.description.length).toBeGreaterThan(0);
    expect(diceFrenzyTallPlugin.settings).toBeDefined();
    expect(typeof diceFrenzyTallPlugin.settings).toBe("object");
    expect(typeof diceFrenzyTallPlugin.initialState).toBe("function");
    expect(typeof diceFrenzyTallPlugin.reducer).toBe("function");
    expect(typeof diceFrenzyTallPlugin.isTerminal).toBe("function");
    expect(diceFrenzyTallPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh roll", () => {
    const a = diceFrenzyTallPlugin.initialState(1234, S);
    const b = diceFrenzyTallPlugin.initialState(1234, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.dice).toHaveLength(5);
    a.dice.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.rerollUsed).toBe(false);
    expect(a.selected).toEqual([false, false, false, false, false]);
    expect(diceFrenzyTallPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof diceFrenzyTallPlugin.hint).toBe("function");
    const state = diceFrenzyTallPlugin.initialState(7, S);
    const result = diceFrenzyTallPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-frenzy-tall-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: DiceFrenzyTallState = { ...state, phase: "done" };
    expect(diceFrenzyTallPlugin.hint!(done)).toBeNull();
    expect(diceFrenzyTallPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
