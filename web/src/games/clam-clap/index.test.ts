import { describe, it, expect } from "vitest";
import { clamClapPlugin } from "./index.js";
import type { ClamClapState } from "./state.js";

const S = { dummy: false };

describe("clam-clap plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(clamClapPlugin.id).toBe("clam-clap");
    expect(clamClapPlugin.title).toBe("Clam Clap");
    expect(clamClapPlugin.category).toBe("arcade");
    expect(clamClapPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clamClapPlugin.description).toBe("string");
    expect(clamClapPlugin.description.length).toBeGreaterThan(0);
    expect(clamClapPlugin.settings).toBeDefined();
    expect(typeof clamClapPlugin.settings).toBe("object");
    expect(typeof clamClapPlugin.initialState).toBe("function");
    expect(typeof clamClapPlugin.reducer).toBe("function");
    expect(typeof clamClapPlugin.isTerminal).toBe("function");
    expect(clamClapPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = clamClapPlugin.initialState(42, S);
    const b = clamClapPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.critters).toEqual([]);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(clamClapPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof clamClapPlugin.hint).toBe("function");

    // Fresh state has no critters -> hint must be null.
    const fresh = clamClapPlugin.initialState(5, S);
    expect(clamClapPlugin.hint!(fresh)).toBeNull();

    // State with at least one critter -> hint must return a HintTarget.
    const withCritter: ClamClapState = {
      ...fresh,
      critters: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const result = clamClapPlugin.hint!(withCritter);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid=/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Done phase -> hint must be null regardless of critters.
    const done: ClamClapState = { ...withCritter, phase: "done" };
    expect(clamClapPlugin.hint!(done)).toBeNull();
  });
});
