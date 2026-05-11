import { describe, it, expect } from "vitest";
import { cartographersMonstersPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("cartographers-monsters plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cartographersMonstersPlugin.id).toBe("cartographers-monsters");
    expect(cartographersMonstersPlugin.title).toBe("Cartographers Monsters");
    expect(cartographersMonstersPlugin.category).toBe("dice");
    expect(cartographersMonstersPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cartographersMonstersPlugin.description).toBe("string");
    expect(cartographersMonstersPlugin.description.length).toBeGreaterThan(0);
    expect(cartographersMonstersPlugin.settings).toBeDefined();
    expect(typeof cartographersMonstersPlugin.settings).toBe("object");
    expect(typeof cartographersMonstersPlugin.initialState).toBe("function");
    expect(typeof cartographersMonstersPlugin.reducer).toBe("function");
    expect(typeof cartographersMonstersPlugin.isTerminal).toBe("function");
    expect(cartographersMonstersPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cartographersMonstersPlugin.initialState(42, S);
    const b = cartographersMonstersPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rolls).toBe(0);
    expect(a.score).toBe(0);
    expect(a.lastRoll).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.cells).toHaveLength(16);
    expect(a.cells.every((c) => c === false)).toBe(true);
    expect(cartographersMonstersPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for known phases", () => {
    expect(typeof cartographersMonstersPlugin.hint).toBe("function");
    const state = cartographersMonstersPlugin.initialState(5, S);
    const rollHint = cartographersMonstersPlugin.hint!(state);
    expect(rollHint).not.toBeNull();
    expect(typeof rollHint!.selector).toBe("string");
    expect(rollHint!.selector.length).toBeGreaterThan(0);
    expect(rollHint!.selector).toContain("cartographers-monsters");
    expect(rollHint!.pulses).toBe(3);

    const markingHint = cartographersMonstersPlugin.hint!({ ...state, phase: "marking" });
    expect(markingHint).not.toBeNull();
    expect(markingHint!.selector).toContain("mark");
    expect(markingHint!.pulses).toBe(3);

    // Unknown phase falls back to the default (roll) target.
    const fallback = cartographersMonstersPlugin.hint!({ ...state, phase: "done" as never });
    expect(fallback).not.toBeNull();
    expect(fallback!.selector).toContain("roll");
  });
});
