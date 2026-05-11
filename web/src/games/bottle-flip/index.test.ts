import { describe, it, expect } from "vitest";
import { bottleFlipPlugin } from "./index.js";
import type { BottleFlipState } from "./state.js";

const S = {} as never;

describe("bottle-flip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bottleFlipPlugin.id).toBe("bottle-flip");
    expect(bottleFlipPlugin.title).toBe("Bottle Flip");
    expect(bottleFlipPlugin.category).toBe("arcade");
    expect(bottleFlipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bottleFlipPlugin.description).toBe("string");
    expect(bottleFlipPlugin.description.length).toBeGreaterThan(0);
    expect(bottleFlipPlugin.settings).toBeDefined();
    expect(typeof bottleFlipPlugin.settings).toBe("object");
    expect(typeof bottleFlipPlugin.initialState).toBe("function");
    expect(typeof bottleFlipPlugin.reducer).toBe("function");
    expect(typeof bottleFlipPlugin.isTerminal).toBe("function");
    expect(bottleFlipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = bottleFlipPlugin.initialState(42, S);
    const b = bottleFlipPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("aiming");
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(8);
    expect(bottleFlipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when game is over", () => {
    expect(typeof bottleFlipPlugin.hint).toBe("function");
    const state = bottleFlipPlugin.initialState(5, S);
    const result = bottleFlipPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bottle-flip-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: BottleFlipState = { ...state, phase: "gameover" };
    expect(bottleFlipPlugin.hint!(finished)).toBeNull();
    expect(bottleFlipPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
