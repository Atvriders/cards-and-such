import { describe, it, expect } from "vitest";
import { colorReactionPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("color-reaction plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(colorReactionPlugin.id).toBe("color-reaction");
    expect(colorReactionPlugin.title).toBe("Color Reaction");
    expect(colorReactionPlugin.category).toBe("arcade");
    expect(colorReactionPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof colorReactionPlugin.description).toBe("string");
    expect(colorReactionPlugin.description.length).toBeGreaterThan(0);
    expect(colorReactionPlugin.settings).toBeDefined();
    expect(typeof colorReactionPlugin.settings).toBe("object");
    expect(typeof colorReactionPlugin.initialState).toBe("function");
    expect(typeof colorReactionPlugin.reducer).toBe("function");
    expect(typeof colorReactionPlugin.isTerminal).toBe("function");
    expect(colorReactionPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = colorReactionPlugin.initialState(1234, S);
    const b = colorReactionPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.hits).toBe(0);
    expect(a.misses).toBe(0);
    expect(a.hasReactedThisTick).toBe(false);
    expect(a.ticksRemaining).toBe(30);
    expect(typeof a.isGo).toBe("boolean");
    expect(colorReactionPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof colorReactionPlugin.hint).toBe("function");
    const state = colorReactionPlugin.initialState(7, S);
    const result = colorReactionPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".clrrct-target");
      expect(result.pulses).toBe(3);
    }

    const doneState = { ...state, phase: "done" as const };
    expect(colorReactionPlugin.hint!(doneState)).toBeNull();
    expect(colorReactionPlugin.isTerminal(doneState)).toEqual({ score: state.score });
  });
});
