import { describe, it, expect } from "vitest";
import { clankInSpacePlugin } from "./index.js";
import type { ClankInSpaceState } from "./state.js";

const S = { difficulty: "Standard" } as const;

describe("clank-in-space plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(clankInSpacePlugin.id).toBe("clank-in-space");
    expect(clankInSpacePlugin.title).toBe("Clank! In! Space!");
    expect(clankInSpacePlugin.category).toBe("board");
    expect(clankInSpacePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clankInSpacePlugin.description).toBe("string");
    expect(clankInSpacePlugin.description.length).toBeGreaterThan(0);
    expect(clankInSpacePlugin.settings).toBeDefined();
    expect(typeof clankInSpacePlugin.settings).toBe("object");
    expect(typeof clankInSpacePlugin.initialState).toBe("function");
    expect(typeof clankInSpacePlugin.reducer).toBe("function");
    expect(typeof clankInSpacePlugin.isTerminal).toBe("function");
    expect(typeof clankInSpacePlugin.hint).toBe("function");
    expect(clankInSpacePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = clankInSpacePlugin.initialState(42, S);
    const b = clankInSpacePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.morale).toBeGreaterThan(0);
    expect(a.phase).toBe("choose");
    expect(clankInSpacePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    const state = clankInSpacePlugin.initialState(5, S);
    const result = clankInSpacePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-coop-tactic-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force phase "done" to drive coopHintSelector through its null return.
    const finished: ClankInSpaceState = { ...state, phase: "done" };
    expect(clankInSpacePlugin.hint!(finished)).toBeNull();
  });
});
