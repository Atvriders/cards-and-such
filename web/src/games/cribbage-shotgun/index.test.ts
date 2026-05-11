import { describe, it, expect } from "vitest";
import { cribbageShotgunPlugin } from "./index.js";

const S = { dummy: true } as never;

describe("cribbage-shotgun plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cribbageShotgunPlugin.id).toBe("cribbage-shotgun");
    expect(cribbageShotgunPlugin.title).toBe("Cribbage Shotgun");
    expect(cribbageShotgunPlugin.category).toBe("arcade");
    expect(cribbageShotgunPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cribbageShotgunPlugin.description).toBe("string");
    expect(cribbageShotgunPlugin.description.length).toBeGreaterThan(0);
    expect(cribbageShotgunPlugin.settings).toBeDefined();
    expect(typeof cribbageShotgunPlugin.settings).toBe("object");
    expect(typeof cribbageShotgunPlugin.initialState).toBe("function");
    expect(typeof cribbageShotgunPlugin.reducer).toBe("function");
    expect(typeof cribbageShotgunPlugin.isTerminal).toBe("function");
    expect(cribbageShotgunPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cribbageShotgunPlugin.initialState(42, S);
    const b = cribbageShotgunPlugin.initialState(42, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.myPeg).toBe(0);
    expect(a.cpuPeg).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(cribbageShotgunPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cribbageShotgunPlugin.hint).toBe("function");
    const fresh = cribbageShotgunPlugin.initialState(7, S);
    const result = cribbageShotgunPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-cribbage-shotgun-action"]');
      expect(result.pulses).toBe(3);
    }

    // When the game is in the terminal `done` phase, hint() should return null.
    const done = { ...fresh, phase: "done" as const };
    expect(cribbageShotgunPlugin.hint!(done)).toBeNull();
    expect(cribbageShotgunPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
