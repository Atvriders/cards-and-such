import { describe, it, expect } from "vitest";
import { carcassonneAbbeyMayorPlugin } from "./index.js";
import type { CarcassonneAbbeyMayorState } from "./state.js";

const S = { dummy: false };

describe("carcassonne-abbey-mayor plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonneAbbeyMayorPlugin.id).toBe("carcassonne-abbey-mayor");
    expect(carcassonneAbbeyMayorPlugin.title).toBe("Carcassonne: Abbey & Mayor");
    expect(carcassonneAbbeyMayorPlugin.category).toBe("board");
    expect(carcassonneAbbeyMayorPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonneAbbeyMayorPlugin.description).toBe("string");
    expect(carcassonneAbbeyMayorPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonneAbbeyMayorPlugin.settings).toBeDefined();
    expect(typeof carcassonneAbbeyMayorPlugin.settings).toBe("object");
    expect(typeof carcassonneAbbeyMayorPlugin.initialState).toBe("function");
    expect(typeof carcassonneAbbeyMayorPlugin.reducer).toBe("function");
    expect(typeof carcassonneAbbeyMayorPlugin.isTerminal).toBe("function");
    expect(carcassonneAbbeyMayorPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonneAbbeyMayorPlugin.initialState(42, S);
    const b = carcassonneAbbeyMayorPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.length).toBe(36);
    expect(a.queue.length).toBe(18);
    expect(carcassonneAbbeyMayorPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while empty cells remain and null when board is finished", () => {
    expect(typeof carcassonneAbbeyMayorPlugin.hint).toBe("function");
    const state = carcassonneAbbeyMayorPlugin.initialState(7, S);
    const result = carcassonneAbbeyMayorPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.carcam-grid > button:nth-child\(\d+\)$/);
      expect(result.pulses).toBe(3);
    }

    // When phase is "done", tileBestMoveIndex returns null and hint should follow.
    const finished: CarcassonneAbbeyMayorState = { ...state, phase: "done" };
    expect(carcassonneAbbeyMayorPlugin.hint!(finished)).toBeNull();
  });
});
