import { describe, it, expect } from "vitest";
import { coloredTileMazePlugin } from "./index.js";

describe("colored-tile-maze plugin", () => {
  it("exposes the expected GamePlugin shape", () => {
    expect(coloredTileMazePlugin.id).toBe("colored-tile-maze");
    expect(coloredTileMazePlugin.title).toBe("Colored Tile Maze");
    expect(coloredTileMazePlugin.category).toBe("board");
    expect(coloredTileMazePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coloredTileMazePlugin.initialState).toBe("function");
    expect(typeof coloredTileMazePlugin.reducer).toBe("function");
    expect(typeof coloredTileMazePlugin.isTerminal).toBe("function");
    expect(typeof coloredTileMazePlugin.hint).toBe("function");
    expect(coloredTileMazePlugin.settings).toHaveProperty("size");
    expect(coloredTileMazePlugin.settings.size.default).toBe("small");
    expect(coloredTileMazePlugin.component).toBeDefined();
  });

  it("initialState is deterministic for the same seed and isTerminal is null at start", () => {
    const settings = { size: "small" as const };
    const a = coloredTileMazePlugin.initialState(42, settings);
    const b = coloredTileMazePlugin.initialState(42, settings);
    expect(a).toEqual(b);

    // small => dim 5 => outer 5*2+1 = 11
    expect(a.rows).toBe(11);
    expect(a.cols).toBe(11);
    expect(a.tiles.length).toBe(11 * 11);
    expect(a.playerRow).toBe(1);
    expect(a.playerCol).toBe(1);
    expect(a.moves).toBe(0);
    expect(a.won).toBe(false);
    expect(a.lastEffect).toBeNull();
    expect(coloredTileMazePlugin.isTerminal(a)).toBeNull();

    // medium => dim 7 => outer 7*2+1 = 15
    const med = coloredTileMazePlugin.initialState(1, { size: "medium" });
    expect(med.rows).toBe(15);
    expect(med.cols).toBe(15);
    expect(med.tiles.length).toBe(15 * 15);
  });

  it("hint returns null when the maze svg is absent and a HintTarget when present", () => {
    const settings = { size: "small" as const };
    const state = coloredTileMazePlugin.initialState(7, settings);

    // No .color-maze-svg in DOM => null
    expect(coloredTileMazePlugin.hint!(state)).toBeNull();

    // Inject a matching element => HintTarget
    const svg = document.createElement("div");
    svg.className = "color-maze-svg";
    document.body.appendChild(svg);
    try {
      const h = coloredTileMazePlugin.hint!(state);
      expect(h).not.toBeNull();
      expect(h!.selector).toBe(".color-maze-svg");
      expect(h!.pulses).toBe(3);
    } finally {
      document.body.removeChild(svg);
    }
  });
});
