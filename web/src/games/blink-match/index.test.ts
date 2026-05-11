import { describe, it, expect } from "vitest";
import { blinkMatchPlugin } from "./index.js";
import type { BlinkMatchState } from "./state.js";

const S = { dummy: false };

describe("blink-match plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blinkMatchPlugin.id).toBe("blink-match");
    expect(blinkMatchPlugin.title).toBe("Blink Match");
    expect(blinkMatchPlugin.category).toBe("board");
    expect(blinkMatchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blinkMatchPlugin.description).toBe("string");
    expect(blinkMatchPlugin.description.length).toBeGreaterThan(0);
    expect(blinkMatchPlugin.settings).toBeDefined();
    expect(typeof blinkMatchPlugin.settings).toBe("object");
    expect(typeof blinkMatchPlugin.initialState).toBe("function");
    expect(typeof blinkMatchPlugin.reducer).toBe("function");
    expect(typeof blinkMatchPlugin.isTerminal).toBe("function");
    expect(blinkMatchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blinkMatchPlugin.initialState(42, S);
    const b = blinkMatchPlugin.initialState(42, S);
    expect(JSON.stringify(a.rounds)).toBe(JSON.stringify(b.rounds));
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.rounds.length).toBeGreaterThan(0);
    expect(blinkMatchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof blinkMatchPlugin.hint).toBe("function");
    const state = blinkMatchPlugin.initialState(5, S);
    const result = blinkMatchPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".blnkmtc-cell");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When submitted, hint returns null.
    const submitted: BlinkMatchState = { ...state, submitted: true };
    expect(blinkMatchPlugin.hint!(submitted)).toBeNull();

    // When phase is "done", hint returns null.
    const done: BlinkMatchState = { ...state, phase: "done" };
    expect(blinkMatchPlugin.hint!(done)).toBeNull();
  });
});
