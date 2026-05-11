import { describe, it, expect } from "vitest";
import { cribbageSkunkedRubberPlugin } from "./index.js";
import type { CribbageSkunkedRubberState } from "./state.js";

const S = { dummy: true } as never;

describe("cribbage-skunked-rubber plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cribbageSkunkedRubberPlugin.id).toBe("cribbage-skunked-rubber");
    expect(cribbageSkunkedRubberPlugin.title).toBe("Cribbage Skunked Rubber");
    expect(cribbageSkunkedRubberPlugin.category).toBe("arcade");
    expect(cribbageSkunkedRubberPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cribbageSkunkedRubberPlugin.description).toBe("string");
    expect(cribbageSkunkedRubberPlugin.description.length).toBeGreaterThan(0);
    expect(cribbageSkunkedRubberPlugin.settings).toBeDefined();
    expect(typeof cribbageSkunkedRubberPlugin.settings).toBe("object");
    expect(typeof cribbageSkunkedRubberPlugin.initialState).toBe("function");
    expect(typeof cribbageSkunkedRubberPlugin.reducer).toBe("function");
    expect(typeof cribbageSkunkedRubberPlugin.isTerminal).toBe("function");
    expect(cribbageSkunkedRubberPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cribbageSkunkedRubberPlugin.initialState(42, S);
    const b = cribbageSkunkedRubberPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.myPeg).toBe(0);
    expect(a.cpuPeg).toBe(0);
    expect(cribbageSkunkedRubberPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active state and null when done", () => {
    expect(typeof cribbageSkunkedRubberPlugin.hint).toBe("function");
    const state = cribbageSkunkedRubberPlugin.initialState(5, S);
    const result = cribbageSkunkedRubberPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-cribbage-skunked-rubber-action"]');
      expect(result.pulses).toBe(3);
    }

    const finished: CribbageSkunkedRubberState = { ...state, phase: "done" };
    expect(cribbageSkunkedRubberPlugin.hint!(finished)).toBeNull();
    expect(cribbageSkunkedRubberPlugin.isTerminal(finished)).not.toBeNull();
  });
});
