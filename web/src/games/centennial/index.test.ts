import { describe, it, expect } from "vitest";
import { centennialPlugin } from "./index.js";

describe("centennial plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(centennialPlugin.id).toBe("centennial");
    expect(centennialPlugin.title).toBe("Centennial");
    expect(centennialPlugin.category).toBe("dice");
    expect(centennialPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof centennialPlugin.description).toBe("string");
    expect(centennialPlugin.description.length).toBeGreaterThan(0);
    expect(centennialPlugin.settings).toBeDefined();
    expect(typeof centennialPlugin.settings).toBe("object");
    expect(typeof centennialPlugin.initialState).toBe("function");
    expect(typeof centennialPlugin.reducer).toBe("function");
    expect(typeof centennialPlugin.isTerminal).toBe("function");
    expect(centennialPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const settings = { mode: "vs-bot" as const };
    const a = centennialPlugin.initialState(42, settings);
    const b = centennialPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.playerTarget).toBe(1);
    expect(a.botTarget).toBe(1);
    expect(a.phase).toBe("rolling");
    expect(a.gameOver).toBe(false);
    expect(a.winner).toBeNull();
    expect(a.lastRoll).toBeNull();
    expect(centennialPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is over", () => {
    expect(typeof centennialPlugin.hint).toBe("function");
    const settings = { mode: "vs-bot" as const };
    const state = centennialPlugin.initialState(7, settings);
    const result = centennialPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-centennial-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished = { ...state, gameOver: true, winner: "player" as const, phase: "gameOver" as const };
    expect(centennialPlugin.hint!(finished)).toBeNull();
    expect(centennialPlugin.isTerminal(finished)).toEqual({ score: 100 });
  });
});
