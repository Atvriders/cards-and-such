import { describe, it, expect } from "vitest";
import { bobaBouncePlugin } from "./index.js";
import type { BobaBounceState } from "./state.js";

const S = { dummy: false } as const;

describe("boba-bounce plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bobaBouncePlugin.id).toBe("boba-bounce");
    expect(bobaBouncePlugin.title).toBe("Boba Bounce");
    expect(bobaBouncePlugin.category).toBe("arcade");
    expect(bobaBouncePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bobaBouncePlugin.description).toBe("string");
    expect(bobaBouncePlugin.description.length).toBeGreaterThan(0);
    expect(bobaBouncePlugin.settings).toBeDefined();
    expect(typeof bobaBouncePlugin.settings).toBe("object");
    expect(typeof bobaBouncePlugin.initialState).toBe("function");
    expect(typeof bobaBouncePlugin.reducer).toBe("function");
    expect(typeof bobaBouncePlugin.isTerminal).toBe("function");
    expect(bobaBouncePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bobaBouncePlugin.initialState(42, S);
    const b = bobaBouncePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.items).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(bobaBouncePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bobaBouncePlugin.hint).toBe("function");

    // Fresh state has no items -> hint should return null
    const fresh = bobaBouncePlugin.initialState(5, S);
    expect(bobaBouncePlugin.hint!(fresh)).toBeNull();

    // State with at least one item -> hint should return a HintTarget
    const withItem: BobaBounceState = {
      ...fresh,
      items: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const target = bobaBouncePlugin.hint!(withItem);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector.length).toBeGreaterThan(0);
      expect(target.selector).toMatch(/^\[data-testid="/);
      if (target.pulses !== undefined) {
        expect(typeof target.pulses).toBe("number");
        expect(target.pulses).toBeGreaterThan(0);
      }
    }

    // Done state -> hint always returns null
    const done: BobaBounceState = { ...withItem, phase: "done" };
    expect(bobaBouncePlugin.hint!(done)).toBeNull();
  });
});
