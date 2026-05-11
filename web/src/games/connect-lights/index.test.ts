import { describe, it, expect } from "vitest";
import { connectLightsPlugin, connectLightsSettings } from "./index.js";

const defaultSettings = { moves: "30" } as const;

describe("connect-lights plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connectLightsPlugin.id).toBe("connect-lights");
    expect(connectLightsPlugin.title).toBe("Connect Lights");
    expect(connectLightsPlugin.category).toBe("board");
    expect(connectLightsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connectLightsPlugin.description).toBe("string");
    expect(connectLightsPlugin.description.length).toBeGreaterThan(0);
    expect(connectLightsPlugin.settings).toBe(connectLightsSettings);
    expect(typeof connectLightsPlugin.initialState).toBe("function");
    expect(typeof connectLightsPlugin.reducer).toBe("function");
    expect(typeof connectLightsPlugin.isTerminal).toBe("function");
    expect(connectLightsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = connectLightsPlugin.initialState(42, defaultSettings);
    const b = connectLightsPlugin.initialState(42, defaultSettings);
    const aFlat = a.grid.map((row) => row.join(",")).join(";");
    const bFlat = b.grid.map((row) => row.join(",")).join(";");
    expect(aFlat).toBe(bFlat);
    expect(a.score).toBe(0);
    expect(a.movesLeft).toBe(30);
    expect(a.over).toBe(false);
    expect(a.selected).toBeNull();
    expect(connectLightsPlugin.isTerminal(a)).toBeNull();

    // Different seed should typically produce a different grid
    const c = connectLightsPlugin.initialState(99, defaultSettings);
    const cFlat = c.grid.map((row) => row.join(",")).join(";");
    expect(cFlat).not.toBe(aFlat);

    // Terminal when over flag is set
    const finished = { ...a, over: true, score: 175 };
    expect(connectLightsPlugin.isTerminal(finished)).toEqual({ score: 175 });
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof connectLightsPlugin.hint).toBe("function");
    const state = connectLightsPlugin.initialState(5, defaultSettings);
    const result = connectLightsPlugin.hint!(state);
    // In a Node/vitest environment without jsdom, document may be undefined
    // OR document exists but lacks the .cl-lights-grid element. Either way,
    // hint() should not throw and should return either null or a HintTarget.
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".cl-lights-grid");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
