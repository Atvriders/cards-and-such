import { describe, it, expect } from "vitest";
import { deadOfWinterSurvivalPlugin } from "./index.js";
import type { DeadOfWinterSurvivalState } from "./state.js";

const S = { difficulty: "Standard" } as const;

describe("dead-of-winter-survival plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(deadOfWinterSurvivalPlugin.id).toBe("dead-of-winter-survival");
    expect(deadOfWinterSurvivalPlugin.title).toBe("Dead of Winter: Survival");
    expect(deadOfWinterSurvivalPlugin.category).toBe("board");
    expect(deadOfWinterSurvivalPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof deadOfWinterSurvivalPlugin.description).toBe("string");
    expect(deadOfWinterSurvivalPlugin.description.length).toBeGreaterThan(0);
    expect(deadOfWinterSurvivalPlugin.settings).toBeDefined();
    expect(typeof deadOfWinterSurvivalPlugin.settings).toBe("object");
    expect(typeof deadOfWinterSurvivalPlugin.initialState).toBe("function");
    expect(typeof deadOfWinterSurvivalPlugin.reducer).toBe("function");
    expect(typeof deadOfWinterSurvivalPlugin.isTerminal).toBe("function");
    expect(typeof deadOfWinterSurvivalPlugin.hint).toBe("function");
    expect(deadOfWinterSurvivalPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = deadOfWinterSurvivalPlugin.initialState(42, S);
    const b = deadOfWinterSurvivalPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.morale).toBeGreaterThan(0);
    expect(a.phase).toBe("choose");
    expect(deadOfWinterSurvivalPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    const state = deadOfWinterSurvivalPlugin.initialState(5, S);
    const result = deadOfWinterSurvivalPlugin.hint!(state);
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
    const finished: DeadOfWinterSurvivalState = { ...state, phase: "done" };
    expect(deadOfWinterSurvivalPlugin.hint!(finished)).toBeNull();
  });
});
