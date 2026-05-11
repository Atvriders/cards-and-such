import { describe, it, expect } from "vitest";
import { dartsCricketClassicPlugin } from "./index.js";

const S = { dummy: true } as never;

describe("darts-cricket-classic plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dartsCricketClassicPlugin.id).toBe("darts-cricket-classic");
    expect(dartsCricketClassicPlugin.title).toBe("Classic Cricket Darts");
    expect(dartsCricketClassicPlugin.category).toBe("arcade");
    expect(dartsCricketClassicPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dartsCricketClassicPlugin.description).toBe("string");
    expect(dartsCricketClassicPlugin.description.length).toBeGreaterThan(0);
    expect(dartsCricketClassicPlugin.settings).toBeDefined();
    expect(typeof dartsCricketClassicPlugin.settings).toBe("object");
    expect(typeof dartsCricketClassicPlugin.initialState).toBe("function");
    expect(typeof dartsCricketClassicPlugin.reducer).toBe("function");
    expect(typeof dartsCricketClassicPlugin.isTerminal).toBe("function");
    expect(dartsCricketClassicPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = dartsCricketClassicPlugin.initialState(42, S);
    const b = dartsCricketClassicPlugin.initialState(42, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.closed).toBe(0);
    expect(dartsCricketClassicPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof dartsCricketClassicPlugin.hint).toBe("function");
    const state = dartsCricketClassicPlugin.initialState(5, S);
    const result = dartsCricketClassicPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-darts-cricket-classic-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Terminal state forces hint() through the early-return null branch.
    const done = { ...state, phase: "done" as const };
    expect(dartsCricketClassicPlugin.hint!(done)).toBeNull();
  });
});
