import { describe, it, expect } from "vitest";
import { diceCavePlugin } from "./index.js";
import type { DiceCaveState } from "./state.js";

const S = { dummy: false };

describe("dice-cave plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceCavePlugin.id).toBe("dice-cave");
    expect(diceCavePlugin.title).toBe("Dice Cave");
    expect(diceCavePlugin.category).toBe("dice");
    expect(diceCavePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceCavePlugin.description).toBe("string");
    expect(diceCavePlugin.description.length).toBeGreaterThan(0);
    expect(diceCavePlugin.settings).toBeDefined();
    expect(typeof diceCavePlugin.settings).toBe("object");
    expect(typeof diceCavePlugin.initialState).toBe("function");
    expect(typeof diceCavePlugin.reducer).toBe("function");
    expect(typeof diceCavePlugin.isTerminal).toBe("function");
    expect(diceCavePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceCavePlugin.initialState(42, S);
    const b = diceCavePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("roll");
    expect(diceCavePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof diceCavePlugin.hint).toBe("function");
    const state = diceCavePlugin.initialState(7, S);
    const rollHint = diceCavePlugin.hint!(state);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-cave-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const scoredState: DiceCaveState = { ...state, phase: "scored" };
    const scoredHint = diceCavePlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-cave-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: DiceCaveState = { ...state, phase: "done" };
    expect(diceCavePlugin.hint!(doneState)).toBeNull();
  });
});
