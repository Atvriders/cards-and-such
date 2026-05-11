import { describe, it, expect } from "vitest";
import { crosswordProPlugin } from "./index.js";
import type { CrosswordProSettings } from "./state.js";

const S: CrosswordProSettings = { difficulty: "easy" };

describe("crosswordProPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(crosswordProPlugin.id).toBe("crossword-pro");
    expect(crosswordProPlugin.title).toBe("Crossword Pro");
    expect(crosswordProPlugin.category).toBe("board");
    expect(crosswordProPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crosswordProPlugin.description).toBe("string");
    expect(crosswordProPlugin.description.length).toBeGreaterThan(0);
    expect(crosswordProPlugin.settings).toBeDefined();
    expect(crosswordProPlugin.settings.difficulty.kind).toBe("enum");
    expect(crosswordProPlugin.settings.difficulty.default).toBe("easy");
    expect(crosswordProPlugin.settings.difficulty.options).toEqual(["easy", "medium", "hard"]);
    expect(typeof crosswordProPlugin.initialState).toBe("function");
    expect(typeof crosswordProPlugin.reducer).toBe("function");
    expect(typeof crosswordProPlugin.isTerminal).toBe("function");
    expect(typeof crosswordProPlugin.hint).toBe("function");
    expect(crosswordProPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = crosswordProPlugin.initialState(42, S);
    const b = crosswordProPlugin.initialState(42, S);
    expect(a.size).toBe(5);
    expect(a.won).toBe(false);
    expect(a.reveals).toBe(0);
    expect(a.selectedClue).toBeNull();
    expect(a.settings).toEqual(S);
    expect(a.grid.length).toBe(25);
    expect(a.solution.length).toBe(25);
    expect(a.clues.length).toBeGreaterThan(0);
    // Grid cells are either empty "" or black "#" on fresh state.
    expect(a.grid.every((v) => v === "" || v === "#")).toBe(true);
    // Same seed/settings -> deep equal state.
    expect(b).toEqual(a);
    // Hard difficulty uses a 7x7 grid.
    const hard = crosswordProPlugin.initialState(1, { difficulty: "hard" });
    expect(hard.size).toBe(7);
    expect(hard.grid.length).toBe(49);
    expect(crosswordProPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    const playing = crosswordProPlugin.initialState(7, S);
    const target = crosswordProPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-crossword-pro-action"]');
    expect(target!.pulses).toBe(3);

    // When `won` is true (terminal), hint should return null.
    const wonState = { ...playing, won: true };
    expect(crosswordProPlugin.hint!(wonState)).toBeNull();
  });
});
