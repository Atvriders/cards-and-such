import { describe, it, expect } from "vitest";
import { centuryEasternWondersPlugin } from "./index.js";

const S = { dummy: false };

describe("century-eastern-wonders plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(centuryEasternWondersPlugin.id).toBe("century-eastern-wonders");
    expect(centuryEasternWondersPlugin.title).toBe("Century Eastern Wonders");
    expect(centuryEasternWondersPlugin.category).toBe("board");
    expect(centuryEasternWondersPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof centuryEasternWondersPlugin.description).toBe("string");
    expect(centuryEasternWondersPlugin.description.length).toBeGreaterThan(0);
    expect(centuryEasternWondersPlugin.settings).toBeDefined();
    expect(typeof centuryEasternWondersPlugin.initialState).toBe("function");
    expect(typeof centuryEasternWondersPlugin.reducer).toBe("function");
    expect(typeof centuryEasternWondersPlugin.isTerminal).toBe("function");
    expect(centuryEasternWondersPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = centuryEasternWondersPlugin.initialState(42, S);
    const b = centuryEasternWondersPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(centuryEasternWondersPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    expect(typeof centuryEasternWondersPlugin.hint).toBe("function");
    const state = centuryEasternWondersPlugin.initialState(5, S);
    const result = centuryEasternWondersPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-century-eastern-wonders-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const resolved = { ...state, phase: "resolved" as const };
    expect(centuryEasternWondersPlugin.hint!(resolved)).toBeNull();
    const done = { ...state, phase: "done" as const };
    expect(centuryEasternWondersPlugin.hint!(done)).toBeNull();
  });
});
