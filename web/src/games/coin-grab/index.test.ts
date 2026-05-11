import { describe, it, expect } from "vitest";
import { coinGrabPlugin } from "./index.js";
import type { CoinGrabState } from "./state.js";

const S = { dummy: false } as never;

describe("coin-grab plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coinGrabPlugin.id).toBe("coin-grab");
    expect(coinGrabPlugin.title).toBe("Coin Grab");
    expect(coinGrabPlugin.category).toBe("arcade");
    expect(coinGrabPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coinGrabPlugin.description).toBe("string");
    expect(coinGrabPlugin.description.length).toBeGreaterThan(0);
    expect(coinGrabPlugin.settings).toBeDefined();
    expect(typeof coinGrabPlugin.settings).toBe("object");
    expect(typeof coinGrabPlugin.initialState).toBe("function");
    expect(typeof coinGrabPlugin.reducer).toBe("function");
    expect(typeof coinGrabPlugin.isTerminal).toBe("function");
    expect(coinGrabPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = coinGrabPlugin.initialState(42, S);
    const b = coinGrabPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.targets).toEqual([]);
    expect(coinGrabPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof coinGrabPlugin.hint).toBe("function");

    // Fresh state has no targets -> hint should return null.
    const fresh = coinGrabPlugin.initialState(7, S);
    expect(coinGrabPlugin.hint!(fresh)).toBeNull();

    // After a tick, at least one target will be spawned -> hint should return a HintTarget.
    const ticked = coinGrabPlugin.reducer(fresh, { type: "tick" });
    expect(ticked.targets.length).toBeGreaterThan(0);
    const hint = coinGrabPlugin.hint!(ticked);
    expect(hint).not.toBeNull();
    if (hint !== null) {
      expect(typeof hint.selector).toBe("string");
      expect(hint.selector.length).toBeGreaterThan(0);
      expect(hint.selector).toMatch(/^\[data-testid="/);
      if (hint.pulses !== undefined) {
        expect(typeof hint.pulses).toBe("number");
        expect(hint.pulses).toBeGreaterThan(0);
      }
    }

    // Phase done -> hint returns null even if targets are present.
    const done: CoinGrabState = { ...ticked, phase: "done" };
    expect(coinGrabPlugin.hint!(done)).toBeNull();
  });
});
