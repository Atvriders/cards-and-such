import { describe, it, expect } from "vitest";
import { blokusClassicPlugin } from "./index.js";
import type { BlokusClassicState } from "./state.js";

const S = { dummy: false } as never;

describe("blokus-classic plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blokusClassicPlugin.id).toBe("blokus-classic");
    expect(blokusClassicPlugin.title).toBe("Blokus Classic");
    expect(blokusClassicPlugin.category).toBe("board");
    expect(blokusClassicPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blokusClassicPlugin.description).toBe("string");
    expect(blokusClassicPlugin.description.length).toBeGreaterThan(0);
    expect(blokusClassicPlugin.settings).toBeDefined();
    expect(typeof blokusClassicPlugin.settings).toBe("object");
    expect(typeof blokusClassicPlugin.initialState).toBe("function");
    expect(typeof blokusClassicPlugin.reducer).toBe("function");
    expect(typeof blokusClassicPlugin.isTerminal).toBe("function");
    expect(blokusClassicPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blokusClassicPlugin.initialState(42, S);
    const b = blokusClassicPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.cells.length).toBe(36);
    expect(a.queue.length).toBe(20);
    expect(blokusClassicPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with the expected blkc-grid selector", () => {
    expect(typeof blokusClassicPlugin.hint).toBe("function");
    const state = blokusClassicPlugin.initialState(5, S);
    const result = blokusClassicPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.blkc-grid > button:nth-child\(\d+\)$/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the fall-through `return null` branch by marking the game done.
    const finished: BlokusClassicState = { ...state, phase: "done" };
    expect(blokusClassicPlugin.hint!(finished)).toBeNull();
  });
});
