import { describe, it, expect } from "vitest";
import { mapMemoryPlugin } from "./index.js";

describe("map-memory plugin", () => {
  it("exposes the expected GamePlugin shape", () => {
    expect(mapMemoryPlugin.id).toBe("map-memory");
    expect(mapMemoryPlugin.title).toBe("Map Memory");
    expect(mapMemoryPlugin.category).toBe("board");
    expect(mapMemoryPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof mapMemoryPlugin.initialState).toBe("function");
    expect(typeof mapMemoryPlugin.reducer).toBe("function");
    expect(typeof mapMemoryPlugin.isTerminal).toBe("function");
    expect(typeof mapMemoryPlugin.hint).toBe("function");
    expect(mapMemoryPlugin.settings).toHaveProperty("dummy");
    expect(mapMemoryPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for the same seed and isTerminal=false at start", () => {
    const settings = { dummy: false };
    const a = mapMemoryPlugin.initialState(42, settings);
    const b = mapMemoryPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.rounds.length).toBeGreaterThan(0);
    expect(mapMemoryPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const settings = { dummy: false };
    const playing = mapMemoryPlugin.initialState(7, settings);
    const h = mapMemoryPlugin.hint!(playing);
    expect(h).not.toBeNull();
    expect(h!.selector).toBe('[data-testid="hint-target-map-memory-answer-0"]');
    expect(h!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(mapMemoryPlugin.hint!(done)).toBeNull();
  });
});
