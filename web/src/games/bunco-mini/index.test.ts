import { describe, it, expect } from "vitest";
import { buncoMiniPlugin } from "./index.js";
import type { BuncoMiniState } from "./state.js";

const S = { dummy: false } as never;

describe("bunco-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(buncoMiniPlugin.id).toBe("bunco-mini");
    expect(buncoMiniPlugin.title).toBe("Bunco Mini");
    expect(buncoMiniPlugin.category).toBe("dice");
    expect(buncoMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof buncoMiniPlugin.description).toBe("string");
    expect(buncoMiniPlugin.description.length).toBeGreaterThan(0);
    expect(buncoMiniPlugin.settings).toBeDefined();
    expect(typeof buncoMiniPlugin.settings).toBe("object");
    expect(typeof buncoMiniPlugin.initialState).toBe("function");
    expect(typeof buncoMiniPlugin.reducer).toBe("function");
    expect(typeof buncoMiniPlugin.isTerminal).toBe("function");
    expect(buncoMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = buncoMiniPlugin.initialState(42, S);
    const b = buncoMiniPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.buncos).toBe(0);
    expect(a.dice).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(buncoMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when the game is done", () => {
    expect(typeof buncoMiniPlugin.hint).toBe("function");
    const fresh = buncoMiniPlugin.initialState(7, S);
    const result = buncoMiniPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bunco-mini-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: BuncoMiniState = { ...fresh, phase: "done" };
    expect(buncoMiniPlugin.isTerminal(finished)).toEqual({ score: finished.score });
    expect(buncoMiniPlugin.hint!(finished)).toBeNull();
  });
});
