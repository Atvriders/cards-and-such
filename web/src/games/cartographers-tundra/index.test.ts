import { describe, it, expect } from "vitest";
import { cartographersTundraPlugin } from "./index.js";
import type { CartographersTundraState } from "./state.js";

const S = { dummy: false };

describe("cartographers-tundra plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cartographersTundraPlugin.id).toBe("cartographers-tundra");
    expect(cartographersTundraPlugin.title).toBe("Cartographers Tundra");
    expect(cartographersTundraPlugin.category).toBe("dice");
    expect(cartographersTundraPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cartographersTundraPlugin.description).toBe("string");
    expect(cartographersTundraPlugin.description.length).toBeGreaterThan(0);
    expect(cartographersTundraPlugin.settings).toBeDefined();
    expect(typeof cartographersTundraPlugin.settings).toBe("object");
    expect(typeof cartographersTundraPlugin.initialState).toBe("function");
    expect(typeof cartographersTundraPlugin.reducer).toBe("function");
    expect(typeof cartographersTundraPlugin.isTerminal).toBe("function");
    expect(cartographersTundraPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = cartographersTundraPlugin.initialState(42, S);
    const b = cartographersTundraPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42 >>> 0);
    expect(a.rolls).toBe(0);
    expect(a.score).toBe(0);
    expect(a.lastRoll).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.cells.length).toBe(16);
    expect(a.cells.every((v) => v === false)).toBe(true);
    expect(a.cellValues.length).toBe(16);
    expect(a.cellValues.every((v) => v === 0)).toBe(true);
    expect(cartographersTundraPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for known phases and falls back for unknown phases", () => {
    expect(typeof cartographersTundraPlugin.hint).toBe("function");
    const state = cartographersTundraPlugin.initialState(5, S);

    const rollingHint = cartographersTundraPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    if (rollingHint !== null) {
      expect(typeof rollingHint.selector).toBe("string");
      expect(rollingHint.selector.length).toBeGreaterThan(0);
      expect(rollingHint.selector).toContain("hint-target-cartographers-tundra-roll");
      expect(rollingHint.pulses).toBe(3);
    }

    const markingState: CartographersTundraState = { ...state, phase: "marking" };
    const markingHint = cartographersTundraPlugin.hint!(markingState);
    expect(markingHint).not.toBeNull();
    if (markingHint !== null) {
      expect(markingHint.selector).toContain("hint-target-cartographers-tundra-mark");
      expect(markingHint.pulses).toBe(3);
    }

    // Unknown phase falls through to the default roll selector.
    const weirdState = { ...state, phase: "no-such-phase" } as unknown as CartographersTundraState;
    const fallback = cartographersTundraPlugin.hint!(weirdState);
    expect(fallback).not.toBeNull();
    if (fallback !== null) {
      expect(fallback.selector).toContain("hint-target-cartographers-tundra-roll");
    }
  });
});
