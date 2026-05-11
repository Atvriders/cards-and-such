import { describe, it, expect } from "vitest";
import { carcassonneSafariPlugin } from "./index.js";
import type { CarcassonneSafariState } from "./state.js";

const S = { dummy: false };

describe("carcassonne-safari plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonneSafariPlugin.id).toBe("carcassonne-safari");
    expect(carcassonneSafariPlugin.title).toBe("Carcassonne: Safari");
    expect(carcassonneSafariPlugin.category).toBe("board");
    expect(carcassonneSafariPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonneSafariPlugin.description).toBe("string");
    expect(carcassonneSafariPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonneSafariPlugin.settings).toBeDefined();
    expect(typeof carcassonneSafariPlugin.settings).toBe("object");
    expect(typeof carcassonneSafariPlugin.initialState).toBe("function");
    expect(typeof carcassonneSafariPlugin.reducer).toBe("function");
    expect(typeof carcassonneSafariPlugin.isTerminal).toBe("function");
    expect(carcassonneSafariPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonneSafariPlugin.initialState(42, S);
    const b = carcassonneSafariPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.length).toBe(36);
    expect(a.queue.length).toBe(18);
    expect(carcassonneSafariPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while empty cells remain and null when board is finished", () => {
    expect(typeof carcassonneSafariPlugin.hint).toBe("function");
    const state = carcassonneSafariPlugin.initialState(7, S);
    const result = carcassonneSafariPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.carcsf-grid > button:nth-child\(\d+\)$/);
      expect(result.pulses).toBe(3);
    }

    // When phase is "done", tileBestMoveIndex returns null and hint should follow.
    const finished: CarcassonneSafariState = { ...state, phase: "done" };
    expect(carcassonneSafariPlugin.hint!(finished)).toBeNull();
  });
});
