import { describe, it, expect } from "vitest";
import { bejeweledStarsMiniPlugin } from "./index.js";
import type { BejeweledStarsMiniState } from "./state.js";

const S = { dummy: false } as const;

describe("bejeweled-stars-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bejeweledStarsMiniPlugin.id).toBe("bejeweled-stars-mini");
    expect(bejeweledStarsMiniPlugin.title).toBe("Bejeweled Stars Mini");
    expect(bejeweledStarsMiniPlugin.category).toBe("arcade");
    expect(bejeweledStarsMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bejeweledStarsMiniPlugin.description).toBe("string");
    expect(bejeweledStarsMiniPlugin.description.length).toBeGreaterThan(0);
    expect(bejeweledStarsMiniPlugin.settings).toBeDefined();
    expect(typeof bejeweledStarsMiniPlugin.settings).toBe("object");
    expect(typeof bejeweledStarsMiniPlugin.initialState).toBe("function");
    expect(typeof bejeweledStarsMiniPlugin.reducer).toBe("function");
    expect(typeof bejeweledStarsMiniPlugin.isTerminal).toBe("function");
    expect(bejeweledStarsMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bejeweledStarsMiniPlugin.initialState(42, S);
    const b = bejeweledStarsMiniPlugin.initialState(42, S);
    const aGrid = a.grid.map((row) => row.join(",")).join(";");
    const bGrid = b.grid.map((row) => row.join(",")).join(";");
    expect(aGrid).toBe(bGrid);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.matches).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(bejeweledStarsMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    expect(typeof bejeweledStarsMiniPlugin.hint).toBe("function");
    const state = bejeweledStarsMiniPlugin.initialState(7, S);
    const result = bejeweledStarsMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bejeweled-stars-mini-action"]');
      expect(result.pulses).toBe(3);
    }

    const finished: BejeweledStarsMiniState = { ...state, phase: "done" };
    expect(bejeweledStarsMiniPlugin.hint!(finished)).toBeNull();
    expect(bejeweledStarsMiniPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
