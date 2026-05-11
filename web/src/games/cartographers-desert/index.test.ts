import { describe, it, expect } from "vitest";
import { cartographersDesertPlugin } from "./index.js";
import type { CartographersDesertState } from "./state.js";

const S = { dummy: false } as const;

describe("cartographers-desert plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cartographersDesertPlugin.id).toBe("cartographers-desert");
    expect(cartographersDesertPlugin.title).toBe("Cartographers Desert");
    expect(cartographersDesertPlugin.category).toBe("dice");
    expect(cartographersDesertPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cartographersDesertPlugin.description).toBe("string");
    expect(cartographersDesertPlugin.description.length).toBeGreaterThan(0);
    expect(cartographersDesertPlugin.settings).toBeDefined();
    expect(typeof cartographersDesertPlugin.settings).toBe("object");
    expect(typeof cartographersDesertPlugin.initialState).toBe("function");
    expect(typeof cartographersDesertPlugin.reducer).toBe("function");
    expect(typeof cartographersDesertPlugin.isTerminal).toBe("function");
    expect(cartographersDesertPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cartographersDesertPlugin.initialState(42, S);
    const b = cartographersDesertPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.rolls).toBe(0);
    expect(a.lastRoll).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.cells.length).toBe(16);
    expect(a.cells.every((v) => v === false)).toBe(true);
    expect(a.cellValues.length).toBe(16);
    expect(a.cellValues.every((v) => v === 0)).toBe(true);
    expect(cartographersDesertPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for both rolling and marking phases", () => {
    expect(typeof cartographersDesertPlugin.hint).toBe("function");
    const state = cartographersDesertPlugin.initialState(7, S);

    const rollingHint = cartographersDesertPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    expect(typeof rollingHint!.selector).toBe("string");
    expect(rollingHint!.selector.length).toBeGreaterThan(0);
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-cartographers-desert-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const markingState: CartographersDesertState = { ...state, phase: "marking", lastRoll: 3 };
    const markingHint = cartographersDesertPlugin.hint!(markingState);
    expect(markingHint).not.toBeNull();
    expect(markingHint!.selector).toBe('[data-testid="hint-target-cartographers-desert-mark"]');
    expect(markingHint!.pulses).toBe(3);

    // Unknown phase falls through to the default `roll` selector branch.
    const doneState: CartographersDesertState = { ...state, phase: "done" };
    const fallback = cartographersDesertPlugin.hint!(doneState);
    expect(fallback).not.toBeNull();
    expect(fallback!.selector).toBe('[data-testid="hint-target-cartographers-desert-roll"]');
  });
});
