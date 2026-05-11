import { describe, it, expect } from "vitest";
import { carcassonneTradersBuildersPlugin } from "./index.js";
import type { CarcassonneTradersBuildersState } from "./state.js";

const S = { dummy: false };

describe("carcassonne-traders-builders plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonneTradersBuildersPlugin.id).toBe("carcassonne-traders-builders");
    expect(carcassonneTradersBuildersPlugin.title).toBe("Carcassonne: Traders & Builders");
    expect(carcassonneTradersBuildersPlugin.category).toBe("board");
    expect(carcassonneTradersBuildersPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonneTradersBuildersPlugin.description).toBe("string");
    expect(carcassonneTradersBuildersPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonneTradersBuildersPlugin.settings).toBeDefined();
    expect(typeof carcassonneTradersBuildersPlugin.settings).toBe("object");
    expect(typeof carcassonneTradersBuildersPlugin.initialState).toBe("function");
    expect(typeof carcassonneTradersBuildersPlugin.reducer).toBe("function");
    expect(typeof carcassonneTradersBuildersPlugin.isTerminal).toBe("function");
    expect(carcassonneTradersBuildersPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonneTradersBuildersPlugin.initialState(42, S);
    const b = carcassonneTradersBuildersPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells).toHaveLength(36);
    expect(a.queue).toHaveLength(18);
    expect(carcassonneTradersBuildersPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof carcassonneTradersBuildersPlugin.hint).toBe("function");
    const state = carcassonneTradersBuildersPlugin.initialState(5, S);
    const result = carcassonneTradersBuildersPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("carctrb-grid");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force tileBestMoveIndex to return null: mark game done -> hint should be null.
    const doneState: CarcassonneTradersBuildersState = { ...state, phase: "done" };
    expect(carcassonneTradersBuildersPlugin.hint!(doneState)).toBeNull();
  });
});
