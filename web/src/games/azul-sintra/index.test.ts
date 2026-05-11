import { describe, it, expect } from "vitest";
import { azulSintraPlugin } from "./index.js";
import { CELL_COUNT, TOTAL_TILES, GRID_SIZE } from "./state.js";
import type { AzulSintraState, AzulSintraSettings } from "./state.js";

const S = { dummy: false } as AzulSintraSettings;

describe("azul-sintra plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(azulSintraPlugin.id).toBe("azul-sintra");
    expect(azulSintraPlugin.title).toBe("Azul: Sintra");
    expect(azulSintraPlugin.category).toBe("board");
    expect(azulSintraPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof azulSintraPlugin.description).toBe("string");
    expect(azulSintraPlugin.description.length).toBeGreaterThan(0);
    expect(azulSintraPlugin.settings).toBeDefined();
    expect(typeof azulSintraPlugin.settings).toBe("object");
    expect(typeof azulSintraPlugin.initialState).toBe("function");
    expect(typeof azulSintraPlugin.reducer).toBe("function");
    expect(typeof azulSintraPlugin.isTerminal).toBe("function");
    expect(azulSintraPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = azulSintraPlugin.initialState(42, S);
    const b = azulSintraPlugin.initialState(42, S);
    expect(a.cells.join(",")).toBe(b.cells.join(","));
    expect(a.queue.join(",")).toBe(b.queue.join(","));
    expect(a.cells).toHaveLength(CELL_COUNT);
    expect(a.queue).toHaveLength(TOTAL_TILES);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.config.gridSize).toBe(GRID_SIZE);
    expect(azulSintraPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof azulSintraPlugin.hint).toBe("function");
    const state = azulSintraPlugin.initialState(5, S);
    const result = azulSintraPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("azulsi-grid");
      expect(result.pulses).toBe(3);
    }

    // Force the no-hint branch by marking the state as done.
    const done: AzulSintraState = { ...state, phase: "done" };
    expect(azulSintraPlugin.hint!(done)).toBeNull();
  });
});
