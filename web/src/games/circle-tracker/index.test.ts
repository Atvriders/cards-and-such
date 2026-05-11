import { describe, it, expect } from "vitest";
import { circleTrackerPlugin } from "./index.js";
import type { CircleTrackerState } from "./state.js";

const S = { dummy: false } as never;

describe("circle-tracker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(circleTrackerPlugin.id).toBe("circle-tracker");
    expect(circleTrackerPlugin.title).toBe("Circle Tracker");
    expect(circleTrackerPlugin.category).toBe("arcade");
    expect(circleTrackerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof circleTrackerPlugin.description).toBe("string");
    expect(circleTrackerPlugin.description.length).toBeGreaterThan(0);
    expect(circleTrackerPlugin.settings).toBeDefined();
    expect(typeof circleTrackerPlugin.settings).toBe("object");
    expect(typeof circleTrackerPlugin.initialState).toBe("function");
    expect(typeof circleTrackerPlugin.reducer).toBe("function");
    expect(typeof circleTrackerPlugin.isTerminal).toBe("function");
    expect(circleTrackerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = circleTrackerPlugin.initialState(1234, S);
    const b = circleTrackerPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.ticksRemaining).toBe(30);
    expect(a.score).toBe(0);
    expect(a.hits).toBe(0);
    expect(a.misses).toBe(0);
    expect(a.hasReactedThisTick).toBe(false);
    expect(typeof a.isGo).toBe("boolean");
    expect(circleTrackerPlugin.isTerminal(a)).toBeNull();

    // Different seeds should still yield valid playing state with default fields intact.
    const c = circleTrackerPlugin.initialState(9999, S);
    expect(c.phase).toBe("playing");
    expect(c.ticksRemaining).toBe(30);
    expect(circleTrackerPlugin.isTerminal(c)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    expect(typeof circleTrackerPlugin.hint).toBe("function");
    const state = circleTrackerPlugin.initialState(7, S);
    const result = circleTrackerPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-circle-tracker-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When phase is "done", hint must return null.
    const done: CircleTrackerState = { ...state, phase: "done" };
    expect(circleTrackerPlugin.hint!(done)).toBeNull();
  });
});
