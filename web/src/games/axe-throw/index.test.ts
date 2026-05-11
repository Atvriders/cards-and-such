import { describe, it, expect } from "vitest";
import { axeThrowPlugin } from "./index.js";

describe("axe-throw plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(axeThrowPlugin.id).toBe("axe-throw");
    expect(axeThrowPlugin.title).toBe("Axe Throw");
    expect(axeThrowPlugin.category).toBe("arcade");
    expect(axeThrowPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof axeThrowPlugin.description).toBe("string");
    expect(axeThrowPlugin.description.length).toBeGreaterThan(0);
    expect(axeThrowPlugin.settings).toBeDefined();
    expect(typeof axeThrowPlugin.settings).toBe("object");
    expect(typeof axeThrowPlugin.initialState).toBe("function");
    expect(typeof axeThrowPlugin.reducer).toBe("function");
    expect(typeof axeThrowPlugin.isTerminal).toBe("function");
    expect(axeThrowPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const settings = { rounds: "7" as const };
    const a = axeThrowPlugin.initialState(42, settings);
    const b = axeThrowPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.totalRounds).toBe(7);
    expect(a.over).toBe(false);
    expect(axeThrowPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for an active game and null when terminal", () => {
    expect(typeof axeThrowPlugin.hint).toBe("function");
    const settings = { rounds: "5" as const };
    const state = axeThrowPlugin.initialState(5, settings);
    const result = axeThrowPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-axe-throw-action"]');
      expect(result.pulses).toBe(3);
    }

    // Force a terminal state to exercise the null branch.
    const terminal = { ...state, over: true };
    expect(axeThrowPlugin.hint!(terminal)).toBeNull();
    expect(axeThrowPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
  });
});
