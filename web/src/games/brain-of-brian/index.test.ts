import { describe, it, expect } from "vitest";
import { brainOfBrianPlugin } from "./index.js";
import type { BrianState } from "./state.js";

const S = { dummy: false } as never;

describe("brain-of-brian plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(brainOfBrianPlugin.id).toBe("brain-of-brian");
    expect(brainOfBrianPlugin.title).toBe("Brain of Brian");
    expect(brainOfBrianPlugin.category).toBe("board");
    expect(brainOfBrianPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof brainOfBrianPlugin.description).toBe("string");
    expect(brainOfBrianPlugin.description.length).toBeGreaterThan(0);
    expect(brainOfBrianPlugin.settings).toBeDefined();
    expect(typeof brainOfBrianPlugin.settings).toBe("object");
    expect(typeof brainOfBrianPlugin.initialState).toBe("function");
    expect(typeof brainOfBrianPlugin.reducer).toBe("function");
    expect(typeof brainOfBrianPlugin.isTerminal).toBe("function");
    expect(brainOfBrianPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = brainOfBrianPlugin.initialState(42, S);
    const b = brainOfBrianPlugin.initialState(42, S);
    expect(a.grid.join(",")).toBe(b.grid.join(","));
    expect(a.generation).toBe(0);
    expect(a.liveSum).toBe(0);
    expect(a.phase).toBe("editing");
    expect(a.rngSeed).toBe(42);
    expect(brainOfBrianPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof brainOfBrianPlugin.hint).toBe("function");
    const state = brainOfBrianPlugin.initialState(5, S);
    const result = brainOfBrianPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".brb-step");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal branch by setting phase to "done"
    const done: BrianState = { ...state, phase: "done" };
    expect(brainOfBrianPlugin.hint!(done)).toBeNull();
  });
});
