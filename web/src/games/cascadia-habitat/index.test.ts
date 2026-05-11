import { describe, it, expect } from "vitest";
import { cascadiaHabitatPlugin } from "./index.js";
import type { CascadiaHabitatState } from "./state.js";

const S = { dummy: false } as never;

describe("cascadia-habitat plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cascadiaHabitatPlugin.id).toBe("cascadia-habitat");
    expect(cascadiaHabitatPlugin.title).toBe("Cascadia: Habitat");
    expect(cascadiaHabitatPlugin.category).toBe("board");
    expect(cascadiaHabitatPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cascadiaHabitatPlugin.description).toBe("string");
    expect(cascadiaHabitatPlugin.description.length).toBeGreaterThan(0);
    expect(cascadiaHabitatPlugin.settings).toBeDefined();
    expect(typeof cascadiaHabitatPlugin.settings).toBe("object");
    expect(typeof cascadiaHabitatPlugin.initialState).toBe("function");
    expect(typeof cascadiaHabitatPlugin.reducer).toBe("function");
    expect(typeof cascadiaHabitatPlugin.isTerminal).toBe("function");
    expect(cascadiaHabitatPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cascadiaHabitatPlugin.initialState(42, S);
    const b = cascadiaHabitatPlugin.initialState(42, S);
    expect(a.cells).toEqual(b.cells);
    expect(a.queue).toEqual(b.queue);
    expect(a.placed).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    // 5x5 grid => 25 cells, 16 tiles total in the queue.
    expect(a.cells.length).toBe(25);
    expect(a.cells.every((v) => v === -1)).toBe(true);
    expect(a.queue.length).toBe(16);
    expect(a.queue.every((t) => t >= 0 && t < 5)).toBe(true);
    expect(cascadiaHabitatPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with the expected cas-grid selector", () => {
    expect(typeof cascadiaHabitatPlugin.hint).toBe("function");
    const state = cascadiaHabitatPlugin.initialState(5, S);
    const result = cascadiaHabitatPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\.cas-grid > button:nth-child\(\d+\)$/);
      expect(result.pulses).toBe(3);
    }

    // Force the fall-through `return null` branch by marking the game done.
    const finished: CascadiaHabitatState = { ...state, phase: "done" };
    expect(cascadiaHabitatPlugin.hint!(finished)).toBeNull();
  });
});
