import { describe, it, expect } from "vitest";
import { butterflyNetPlugin } from "./index.js";
import type { ButterflyNetState } from "./state.js";

const S = { dummy: false } as never;

describe("butterfly-net plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(butterflyNetPlugin.id).toBe("butterfly-net");
    expect(butterflyNetPlugin.title).toBe("Butterfly Net");
    expect(butterflyNetPlugin.category).toBe("arcade");
    expect(butterflyNetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof butterflyNetPlugin.description).toBe("string");
    expect(butterflyNetPlugin.description.length).toBeGreaterThan(0);
    expect(butterflyNetPlugin.settings).toBeDefined();
    expect(typeof butterflyNetPlugin.settings).toBe("object");
    expect(typeof butterflyNetPlugin.initialState).toBe("function");
    expect(typeof butterflyNetPlugin.reducer).toBe("function");
    expect(typeof butterflyNetPlugin.isTerminal).toBe("function");
    expect(butterflyNetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = butterflyNetPlugin.initialState(42, S);
    const b = butterflyNetPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.targets).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.ticksRemaining).toBe(30);
    expect(butterflyNetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof butterflyNetPlugin.hint).toBe("function");

    // Fresh state has no targets => hint should be null.
    const fresh = butterflyNetPlugin.initialState(5, S);
    expect(butterflyNetPlugin.hint!(fresh)).toBeNull();

    // Inject a target to force the HintTarget branch.
    const withTarget: ButterflyNetState = {
      ...fresh,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const result = butterflyNetPlugin.hint!(withTarget);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-butterfly-net/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Done phase should return null even with targets present.
    const done: ButterflyNetState = { ...withTarget, phase: "done" };
    expect(butterflyNetPlugin.hint!(done)).toBeNull();
  });
});
