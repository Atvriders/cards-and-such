import { describe, it, expect } from "vitest";
import { bowling9pinPlugin } from "./index.js";
import type { Bowling9pinState } from "./state.js";

const S = { dummy: true } as never;

describe("bowling-9pin plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bowling9pinPlugin.id).toBe("bowling-9pin");
    expect(bowling9pinPlugin.title).toBe("9-Pin Bowling");
    expect(bowling9pinPlugin.category).toBe("arcade");
    expect(bowling9pinPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bowling9pinPlugin.description).toBe("string");
    expect(bowling9pinPlugin.description.length).toBeGreaterThan(0);
    expect(bowling9pinPlugin.settings).toBeDefined();
    expect(typeof bowling9pinPlugin.settings).toBe("object");
    expect(typeof bowling9pinPlugin.initialState).toBe("function");
    expect(typeof bowling9pinPlugin.reducer).toBe("function");
    expect(typeof bowling9pinPlugin.isTerminal).toBe("function");
    expect(bowling9pinPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bowling9pinPlugin.initialState(42, S);
    const b = bowling9pinPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(bowling9pinPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bowling9pinPlugin.hint).toBe("function");
    const state = bowling9pinPlugin.initialState(5, S);
    const result = bowling9pinPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("hint-target");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the gameover branch via phase === "done"
    const done: Bowling9pinState = { ...state, phase: "done" };
    expect(bowling9pinPlugin.hint!(done)).toBeNull();
  });
});
