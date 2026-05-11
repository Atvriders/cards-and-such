import { describe, it, expect } from "vitest";
import { chimpTestPlugin } from "./index.js";

describe("chimp-test plugin", () => {
  const defaultSettings = { startCount: "4" as const, difficulty: "medium" as const };

  it("exposes the expected plugin shape", () => {
    expect(chimpTestPlugin.id).toBe("chimp-test");
    expect(chimpTestPlugin.title).toBe("Chimp Test");
    expect(chimpTestPlugin.category).toBe("board");
    expect(chimpTestPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chimpTestPlugin.description).toBe("string");
    expect(chimpTestPlugin.description.length).toBeGreaterThan(0);
    expect(chimpTestPlugin.settings).toBeDefined();
    expect(typeof chimpTestPlugin.settings).toBe("object");
    expect(typeof chimpTestPlugin.initialState).toBe("function");
    expect(typeof chimpTestPlugin.reducer).toBe("function");
    expect(typeof chimpTestPlugin.isTerminal).toBe("function");
    expect(chimpTestPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = chimpTestPlugin.initialState(42, defaultSettings);
    const b = chimpTestPlugin.initialState(42, defaultSettings);
    const aCells = a.cells.map((c) => `${c.number}:${c.x},${c.y}`).join("|");
    const bCells = b.cells.map((c) => `${c.number}:${c.x},${c.y}`).join("|");
    expect(aCells).toBe(bCells);
    expect(a.phase).toBe("show");
    expect(a.lives).toBe(3);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.count).toBe(4);
    expect(a.cells.length).toBe(4);
    expect(chimpTestPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a live game and null when game is over", () => {
    expect(typeof chimpTestPlugin.hint).toBe("function");
    const state = chimpTestPlugin.initialState(5, defaultSettings);
    const result = chimpTestPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-chimp-test-action"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force terminal state to hit the null branch
    const done = { ...state, phase: "done" as const };
    expect(chimpTestPlugin.hint!(done)).toBeNull();
    expect(chimpTestPlugin.isTerminal(done)).toEqual({ score: state.score });
  });
});
