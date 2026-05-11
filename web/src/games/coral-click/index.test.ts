import { describe, it, expect } from "vitest";
import { coralClickPlugin } from "./index.js";
import type { CoralClickState } from "./state.js";

const S = { dummy: false } as never;

describe("coral-click plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coralClickPlugin.id).toBe("coral-click");
    expect(coralClickPlugin.title).toBe("Coral Click");
    expect(coralClickPlugin.category).toBe("arcade");
    expect(coralClickPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coralClickPlugin.description).toBe("string");
    expect(coralClickPlugin.description.length).toBeGreaterThan(0);
    expect(coralClickPlugin.settings).toBeDefined();
    expect(typeof coralClickPlugin.settings).toBe("object");
    expect(typeof coralClickPlugin.initialState).toBe("function");
    expect(typeof coralClickPlugin.reducer).toBe("function");
    expect(typeof coralClickPlugin.isTerminal).toBe("function");
    expect(coralClickPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = coralClickPlugin.initialState(42, S);
    const b = coralClickPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.critters).toEqual([]);
    expect(coralClickPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no critters and a HintTarget when critters exist; null when done", () => {
    expect(typeof coralClickPlugin.hint).toBe("function");

    const fresh = coralClickPlugin.initialState(5, S);
    // No critters on a freshly initialized state -> hint should be null.
    expect(coralClickPlugin.hint!(fresh)).toBeNull();

    // Inject a critter to exercise the HintTarget branch.
    const withCritter: CoralClickState = {
      ...fresh,
      critters: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const target = coralClickPlugin.hint!(withCritter);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector.length).toBeGreaterThan(0);
      expect(target.selector).toBe('[data-testid="hint-target-coral-click-target"]');
      expect(target.pulses).toBe(3);
    }

    // Done phase -> hint should be null regardless of critters.
    const done: CoralClickState = {
      ...withCritter,
      phase: "done",
    };
    expect(coralClickPlugin.hint!(done)).toBeNull();
  });
});
