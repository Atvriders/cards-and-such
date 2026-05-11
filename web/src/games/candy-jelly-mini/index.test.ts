import { describe, it, expect } from "vitest";
import { candyJellyMiniPlugin } from "./index.js";
import type { CandyJellyMiniState } from "./state.js";

const S = { dummy: false };

describe("candy-jelly-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(candyJellyMiniPlugin.id).toBe("candy-jelly-mini");
    expect(candyJellyMiniPlugin.title).toBe("Candy Jelly Mini");
    expect(candyJellyMiniPlugin.category).toBe("arcade");
    expect(candyJellyMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof candyJellyMiniPlugin.description).toBe("string");
    expect(candyJellyMiniPlugin.description.length).toBeGreaterThan(0);
    expect(candyJellyMiniPlugin.settings).toBeDefined();
    expect(typeof candyJellyMiniPlugin.settings).toBe("object");
    expect(typeof candyJellyMiniPlugin.initialState).toBe("function");
    expect(typeof candyJellyMiniPlugin.reducer).toBe("function");
    expect(typeof candyJellyMiniPlugin.isTerminal).toBe("function");
    expect(candyJellyMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = candyJellyMiniPlugin.initialState(42, S);
    const b = candyJellyMiniPlugin.initialState(42, S);
    const aIds = a.grid.map((row) => row.join(",")).join(";");
    const bIds = b.grid.map((row) => row.join(",")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.selected).toBeNull();
    expect(candyJellyMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof candyJellyMiniPlugin.hint).toBe("function");
    const state = candyJellyMiniPlugin.initialState(5, S);
    const result = candyJellyMiniPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the game is over, hint() should fall through to null.
    const finished: CandyJellyMiniState = { ...state, phase: "done" };
    expect(candyJellyMiniPlugin.hint!(finished)).toBeNull();
  });
});
