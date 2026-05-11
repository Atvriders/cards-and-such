import { describe, it, expect } from "vitest";
import { cakeClutchPlugin } from "./index.js";
import type { CakeClutchState } from "./state.js";

const S = { dummy: false } as { dummy: boolean };

describe("cake-clutch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cakeClutchPlugin.id).toBe("cake-clutch");
    expect(cakeClutchPlugin.title).toBe("Cake Clutch");
    expect(cakeClutchPlugin.category).toBe("arcade");
    expect(cakeClutchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cakeClutchPlugin.description).toBe("string");
    expect(cakeClutchPlugin.description.length).toBeGreaterThan(0);
    expect(cakeClutchPlugin.settings).toBeDefined();
    expect(typeof cakeClutchPlugin.settings).toBe("object");
    expect(typeof cakeClutchPlugin.initialState).toBe("function");
    expect(typeof cakeClutchPlugin.reducer).toBe("function");
    expect(typeof cakeClutchPlugin.isTerminal).toBe("function");
    expect(cakeClutchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cakeClutchPlugin.initialState(42, S);
    const b = cakeClutchPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.items).toEqual([]);
    expect(a.rngSeed).toBe(42);
    expect(cakeClutchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cakeClutchPlugin.hint).toBe("function");
    const fresh = cakeClutchPlugin.initialState(5, S);
    // Fresh state has empty items -> hint should be null.
    expect(cakeClutchPlugin.hint!(fresh)).toBeNull();

    // With items present and phase playing, hint returns a HintTarget.
    const withItems: CakeClutchState = {
      ...fresh,
      items: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const target = cakeClutchPlugin.hint!(withItems);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector.length).toBeGreaterThan(0);
      expect(target.selector).toMatch(/cake-clutch/);
      if (target.pulses !== undefined) {
        expect(typeof target.pulses).toBe("number");
        expect(target.pulses).toBeGreaterThan(0);
      }
    }

    // When phase is done, hint should always be null even with items.
    const done: CakeClutchState = {
      ...withItems,
      phase: "done",
    };
    expect(cakeClutchPlugin.hint!(done)).toBeNull();
  });
});
