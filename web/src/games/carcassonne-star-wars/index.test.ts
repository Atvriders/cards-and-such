import { describe, it, expect } from "vitest";
import { carcassonneStarWarsPlugin } from "./index.js";
import type { CarcassonneStarWarsState } from "./state.js";

const S = { dummy: false };

describe("carcassonne-star-wars plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonneStarWarsPlugin.id).toBe("carcassonne-star-wars");
    expect(carcassonneStarWarsPlugin.title).toBe("Carcassonne: Star Wars");
    expect(carcassonneStarWarsPlugin.category).toBe("board");
    expect(carcassonneStarWarsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonneStarWarsPlugin.description).toBe("string");
    expect(carcassonneStarWarsPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonneStarWarsPlugin.settings).toBeDefined();
    expect(typeof carcassonneStarWarsPlugin.settings).toBe("object");
    expect(typeof carcassonneStarWarsPlugin.initialState).toBe("function");
    expect(typeof carcassonneStarWarsPlugin.reducer).toBe("function");
    expect(typeof carcassonneStarWarsPlugin.isTerminal).toBe("function");
    expect(carcassonneStarWarsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonneStarWarsPlugin.initialState(42, S);
    const b = carcassonneStarWarsPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.length).toBe(36);
    expect(a.queue.length).toBe(18);
    expect(carcassonneStarWarsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while empty cells remain and null when board is finished", () => {
    expect(typeof carcassonneStarWarsPlugin.hint).toBe("function");
    const state = carcassonneStarWarsPlugin.initialState(7, S);
    const result = carcassonneStarWarsPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.carcsw-grid > button:nth-child\(\d+\)$/);
      expect(result.pulses).toBe(3);
    }

    // When phase is "done", tileBestMoveIndex returns null and hint should follow.
    const finished: CarcassonneStarWarsState = { ...state, phase: "done" };
    expect(carcassonneStarWarsPlugin.hint!(finished)).toBeNull();
  });
});
