import { describe, it, expect } from "vitest";
import { battleYahtzeePlugin } from "./index.js";
import type { BattleYahtzeeState } from "./state.js";

const S = { dummy: false };

describe("battle-yahtzee plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(battleYahtzeePlugin.id).toBe("battle-yahtzee");
    expect(battleYahtzeePlugin.title).toBe("Battle Yahtzee");
    expect(battleYahtzeePlugin.category).toBe("dice");
    expect(battleYahtzeePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof battleYahtzeePlugin.description).toBe("string");
    expect(battleYahtzeePlugin.description.length).toBeGreaterThan(0);
    expect(battleYahtzeePlugin.settings).toBeDefined();
    expect(typeof battleYahtzeePlugin.settings).toBe("object");
    expect(typeof battleYahtzeePlugin.initialState).toBe("function");
    expect(typeof battleYahtzeePlugin.reducer).toBe("function");
    expect(typeof battleYahtzeePlugin.isTerminal).toBe("function");
    expect(battleYahtzeePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = battleYahtzeePlugin.initialState(42, S);
    const b = battleYahtzeePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.dice).toEqual([]);
    expect(a.message).toBe("");
    expect(a.rngSeed).toBe(42);
    expect(battleYahtzeePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when not done, and null when phase is done", () => {
    expect(typeof battleYahtzeePlugin.hint).toBe("function");
    const state = battleYahtzeePlugin.initialState(7, S);
    const result = battleYahtzeePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-battle-yahtzee-primary"]');
      expect(result.pulses).toBe(3);
    }

    const finished: BattleYahtzeeState = { ...state, phase: "done" };
    expect(battleYahtzeePlugin.hint!(finished)).toBeNull();
    expect(battleYahtzeePlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
