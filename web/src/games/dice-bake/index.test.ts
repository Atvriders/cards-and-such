import { describe, it, expect } from "vitest";
import { diceBakePlugin } from "./index.js";
import type { DiceBakeState } from "./state.js";

const S = { dummy: false };

describe("dice-bake plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBakePlugin.id).toBe("dice-bake");
    expect(diceBakePlugin.title).toBe("Dice Bake");
    expect(diceBakePlugin.category).toBe("dice");
    expect(diceBakePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBakePlugin.description).toBe("string");
    expect(diceBakePlugin.description.length).toBeGreaterThan(0);
    expect(typeof diceBakePlugin.howToPlay).toBe("string");
    expect(diceBakePlugin.settings).toBeDefined();
    expect(typeof diceBakePlugin.settings).toBe("object");
    expect(typeof diceBakePlugin.initialState).toBe("function");
    expect(typeof diceBakePlugin.reducer).toBe("function");
    expect(typeof diceBakePlugin.isTerminal).toBe("function");
    expect(diceBakePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceBakePlugin.initialState(42, S);
    const b = diceBakePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toEqual([]);
    expect(a.sum).toBe(0);
    expect(a.prevSum).toBe(0);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(diceBakePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof diceBakePlugin.hint).toBe("function");
    const state = diceBakePlugin.initialState(7, S);
    const rolling = diceBakePlugin.hint!(state);
    expect(rolling).not.toBeNull();
    expect(rolling!.selector).toBe('[data-testid="hint-target-dice-bake-roll"]');
    expect(rolling!.pulses).toBe(3);

    const scoredState: DiceBakeState = { ...state, phase: "scored" };
    const scored = diceBakePlugin.hint!(scoredState);
    expect(scored).not.toBeNull();
    expect(scored!.selector).toBe('[data-testid="hint-target-dice-bake-next"]');
    expect(scored!.pulses).toBe(3);

    const doneState: DiceBakeState = { ...state, phase: "done" };
    expect(diceBakePlugin.hint!(doneState)).toBeNull();
  });
});
