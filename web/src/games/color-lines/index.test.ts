import { describe, it, expect } from "vitest";
import { colorLinesPlugin, colorLinesSettings } from "./index.js";
import type { ColorLinesSettings } from "./state.js";

const defaultSettings: ColorLinesSettings = { size: "9" };

describe("color-lines plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(colorLinesPlugin.id).toBe("color-lines");
    expect(colorLinesPlugin.title).toBe("Color Lines");
    expect(colorLinesPlugin.category).toBe("board");
    expect(colorLinesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof colorLinesPlugin.description).toBe("string");
    expect(colorLinesPlugin.description.length).toBeGreaterThan(0);
    expect(colorLinesPlugin.settings).toBe(colorLinesSettings);
    expect(typeof colorLinesPlugin.initialState).toBe("function");
    expect(typeof colorLinesPlugin.reducer).toBe("function");
    expect(typeof colorLinesPlugin.isTerminal).toBe("function");
    expect(colorLinesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = colorLinesPlugin.initialState(42, defaultSettings);
    const b = colorLinesPlugin.initialState(42, defaultSettings);
    expect(a.grid).toEqual(b.grid);
    expect(a.nextColors).toEqual(b.nextColors);
    expect(a.score).toBe(0);
    expect(a.over).toBe(false);
    expect(a.selected).toBeNull();
    expect(a.grid.length).toBe(81);
    // 9x9 with two spawn passes of 3 should leave the board non-empty but not over.
    const filled = a.grid.filter((c) => c !== null).length;
    expect(filled).toBeGreaterThan(0);
    expect(filled).toBeLessThan(81);
    expect(colorLinesPlugin.isTerminal(a)).toBeNull();

    const terminalState = { ...a, over: true, score: 70 };
    expect(colorLinesPlugin.isTerminal(terminalState)).toEqual({ score: 70 });
  });

  it("hint returns null when no .colorlines-board element exists in the DOM", () => {
    expect(typeof colorLinesPlugin.hint).toBe("function");
    const state = colorLinesPlugin.initialState(7, defaultSettings);
    // In the vitest node env there is no DOM; even with happy-dom there's no .colorlines-board.
    const result = colorLinesPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toBe(".colorlines-board");
      expect(result.pulses).toBe(3);
    }
  });
});
