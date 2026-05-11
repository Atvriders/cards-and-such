import { describe, it, expect } from "vitest";
import { bagelBashPlugin } from "./index.js";
import type { BagelBashState } from "./state.js";

const S = { dummy: false } as never;

describe("bagel-bash plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bagelBashPlugin.id).toBe("bagel-bash");
    expect(bagelBashPlugin.title).toBe("Bagel Bash");
    expect(bagelBashPlugin.category).toBe("arcade");
    expect(bagelBashPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bagelBashPlugin.description).toBe("string");
    expect(bagelBashPlugin.description.length).toBeGreaterThan(0);
    expect(bagelBashPlugin.settings).toBeDefined();
    expect(typeof bagelBashPlugin.settings).toBe("object");
    expect(typeof bagelBashPlugin.initialState).toBe("function");
    expect(typeof bagelBashPlugin.reducer).toBe("function");
    expect(typeof bagelBashPlugin.isTerminal).toBe("function");
    expect(bagelBashPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = bagelBashPlugin.initialState(42, S);
    const b = bagelBashPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.items).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(bagelBashPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bagelBashPlugin.hint).toBe("function");

    // Fresh state has no items -> hint should be null.
    const fresh = bagelBashPlugin.initialState(5, S);
    expect(bagelBashPlugin.hint!(fresh)).toBeNull();

    // After a tick, items spawn -> hint should return a HintTarget.
    const afterTick = bagelBashPlugin.reducer(fresh, { type: "tick" });
    expect(afterTick.items.length).toBeGreaterThan(0);
    const result = bagelBashPlugin.hint!(afterTick);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When phase is "done", hint returns null regardless of items.
    const finished: BagelBashState = { ...afterTick, phase: "done" };
    expect(bagelBashPlugin.hint!(finished)).toBeNull();
  });
});
