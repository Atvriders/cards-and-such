import { describe, it, expect } from "vitest";
import { carcassonneGermanCastlesPlugin } from "./index.js";
import { CELL_COUNT, GRID_SIZE, TOTAL_TILES } from "./state.js";

const S = { dummy: false } as const;

describe("carcassonne-german-castles plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carcassonneGermanCastlesPlugin.id).toBe("carcassonne-german-castles");
    expect(carcassonneGermanCastlesPlugin.title).toBe("Carcassonne: German Castles");
    expect(carcassonneGermanCastlesPlugin.category).toBe("board");
    expect(carcassonneGermanCastlesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carcassonneGermanCastlesPlugin.description).toBe("string");
    expect(carcassonneGermanCastlesPlugin.description.length).toBeGreaterThan(0);
    expect(carcassonneGermanCastlesPlugin.settings).toBeDefined();
    expect(typeof carcassonneGermanCastlesPlugin.settings).toBe("object");
    expect(typeof carcassonneGermanCastlesPlugin.initialState).toBe("function");
    expect(typeof carcassonneGermanCastlesPlugin.reducer).toBe("function");
    expect(typeof carcassonneGermanCastlesPlugin.isTerminal).toBe("function");
    expect(carcassonneGermanCastlesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carcassonneGermanCastlesPlugin.initialState(42, S);
    const b = carcassonneGermanCastlesPlugin.initialState(42, S);
    expect(a.cells.length).toBe(CELL_COUNT);
    expect(a.cells.length).toBe(GRID_SIZE * GRID_SIZE);
    expect(a.queue.length).toBe(TOTAL_TILES);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.every((c) => c === -1)).toBe(true);
    expect(a.queue).toEqual(b.queue);
    expect(a.cells).toEqual(b.cells);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(carcassonneGermanCastlesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null once the game is done", () => {
    expect(typeof carcassonneGermanCastlesPlugin.hint).toBe("function");
    const state = carcassonneGermanCastlesPlugin.initialState(7, S);
    const result = carcassonneGermanCastlesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\.carcgc-grid > button:nth-child\(\d+\)$/);
    expect(result!.pulses).toBe(3);

    const done = { ...state, phase: "done" as const };
    expect(carcassonneGermanCastlesPlugin.hint!(done)).toBeNull();
  });
});
