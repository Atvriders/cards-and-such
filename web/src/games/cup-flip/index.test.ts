import { describe, it, expect } from "vitest";
import { cupFlipPlugin } from "./index.js";
import type { CupFlipState } from "./state.js";

const S = {} as never;

describe("cup-flip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cupFlipPlugin.id).toBe("cup-flip");
    expect(cupFlipPlugin.title).toBe("Cup Flip");
    expect(cupFlipPlugin.category).toBe("arcade");
    expect(cupFlipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cupFlipPlugin.description).toBe("string");
    expect(cupFlipPlugin.description.length).toBeGreaterThan(0);
    expect(cupFlipPlugin.settings).toBeDefined();
    expect(typeof cupFlipPlugin.settings).toBe("object");
    expect(typeof cupFlipPlugin.initialState).toBe("function");
    expect(typeof cupFlipPlugin.reducer).toBe("function");
    expect(typeof cupFlipPlugin.isTerminal).toBe("function");
    expect(cupFlipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = cupFlipPlugin.initialState(42, S);
    const b = cupFlipPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("sliding");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.cupPositions).toEqual([0, 1, 2]);
    expect(a.ballUnder).toBeGreaterThanOrEqual(0);
    expect(a.ballUnder).toBeLessThan(3);
    expect(cupFlipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active state and null when game is over", () => {
    expect(typeof cupFlipPlugin.hint).toBe("function");
    const state = cupFlipPlugin.initialState(7, S);
    const result = cupFlipPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-cup-flip-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the gameover branch to return null.
    const over: CupFlipState = { ...state, phase: "gameover" };
    expect(cupFlipPlugin.hint!(over)).toBeNull();
  });
});
