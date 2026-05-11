import { describe, it, expect } from "vitest";
import { crabCatchPlugin } from "./index.js";
import type { CrabCatchState } from "./state.js";

const S = { dummy: false } as never;

describe("crab-catch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crabCatchPlugin.id).toBe("crab-catch");
    expect(crabCatchPlugin.title).toBe("Crab Catch");
    expect(crabCatchPlugin.category).toBe("arcade");
    expect(crabCatchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crabCatchPlugin.description).toBe("string");
    expect(crabCatchPlugin.description.length).toBeGreaterThan(0);
    expect(crabCatchPlugin.settings).toBeDefined();
    expect(typeof crabCatchPlugin.settings).toBe("object");
    expect(typeof crabCatchPlugin.initialState).toBe("function");
    expect(typeof crabCatchPlugin.reducer).toBe("function");
    expect(typeof crabCatchPlugin.isTerminal).toBe("function");
    expect(crabCatchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = crabCatchPlugin.initialState(42, S);
    const b = crabCatchPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.critters).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(crabCatchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no critters are on the board, a HintTarget otherwise, and null when phase is done", () => {
    expect(typeof crabCatchPlugin.hint).toBe("function");
    const fresh = crabCatchPlugin.initialState(7, S);
    // Fresh state has no critters yet -> null.
    expect(crabCatchPlugin.hint!(fresh)).toBeNull();

    // Inject a critter to exercise the HintTarget branch.
    const withCritter: CrabCatchState = {
      ...fresh,
      critters: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const result = crabCatchPlugin.hint!(withCritter);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-crab-catch-target"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the "done" phase to hit the early-return branch.
    const done: CrabCatchState = { ...withCritter, phase: "done" };
    expect(crabCatchPlugin.hint!(done)).toBeNull();
  });
});
