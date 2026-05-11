import { describe, it, expect } from "vitest";
import { clownTossPlugin, clownTossSettings } from "./index.js";

const settings = { pegs: clownTossSettings.pegs.default } as const;

describe("clown-toss plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(clownTossPlugin.id).toBe("clown-toss");
    expect(clownTossPlugin.title).toBe("Clown Toss");
    expect(clownTossPlugin.category).toBe("arcade");
    expect(clownTossPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clownTossPlugin.description).toBe("string");
    expect(clownTossPlugin.description.length).toBeGreaterThan(0);
    expect(clownTossPlugin.settings).toBe(clownTossSettings);
    expect(typeof clownTossPlugin.initialState).toBe("function");
    expect(typeof clownTossPlugin.reducer).toBe("function");
    expect(typeof clownTossPlugin.isTerminal).toBe("function");
    expect(clownTossPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = clownTossPlugin.initialState(42, settings);
    const b = clownTossPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.gameOver).toBe(false);
    expect(a.score).toBe(0);
    expect(a.pegs).toHaveLength(parseInt(settings.pegs, 10));
    expect(a.ringsLeft).toBe(a.totalRings);
    expect(clownTossPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when terminal", () => {
    expect(typeof clownTossPlugin.hint).toBe("function");
    const state = clownTossPlugin.initialState(7, settings);
    const result = clownTossPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const terminal = { ...state, gameOver: true, ringsLeft: 0 };
    expect(clownTossPlugin.isTerminal(terminal)).not.toBeNull();
    expect(clownTossPlugin.hint!(terminal)).toBeNull();
  });
});
