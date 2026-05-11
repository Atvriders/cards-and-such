import { describe, it, expect } from "vitest";
import { birdShootPlugin } from "./index.js";
import type { BirdShootState } from "./state.js";

const S = { duration: "30" } as const;

describe("bird-shoot plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(birdShootPlugin.id).toBe("bird-shoot");
    expect(birdShootPlugin.title).toBe("Bird Shoot");
    expect(birdShootPlugin.category).toBe("arcade");
    expect(birdShootPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof birdShootPlugin.description).toBe("string");
    expect(birdShootPlugin.description.length).toBeGreaterThan(0);
    expect(birdShootPlugin.settings).toBeDefined();
    expect(typeof birdShootPlugin.settings).toBe("object");
    expect(typeof birdShootPlugin.initialState).toBe("function");
    expect(typeof birdShootPlugin.reducer).toBe("function");
    expect(typeof birdShootPlugin.isTerminal).toBe("function");
    expect(birdShootPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = birdShootPlugin.initialState(42, S);
    const b = birdShootPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.lives).toBe(3);
    expect(a.score).toBe(0);
    expect(a.caught).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.timeLeft).toBe(30);
    expect(a.items.length).toBeGreaterThan(0);
    expect(birdShootPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null on gameover", () => {
    expect(typeof birdShootPlugin.hint).toBe("function");
    const state = birdShootPlugin.initialState(5, S);
    const result = birdShootPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/bird-shoot/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: BirdShootState = { ...state, phase: "gameover" };
    expect(birdShootPlugin.hint!(finished)).toBeNull();
    expect(birdShootPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
