import { describe, it, expect } from "vitest";
import { coinDribblePlugin } from "./index.js";
import type { CoinDribblePubState } from "./state.js";

const S = { dummy: true } as never;

describe("coin-dribble-pub plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coinDribblePlugin.id).toBe("coin-dribble-pub");
    expect(coinDribblePlugin.title).toBe("Coin Dribble");
    expect(coinDribblePlugin.category).toBe("arcade");
    expect(coinDribblePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coinDribblePlugin.description).toBe("string");
    expect(coinDribblePlugin.description.length).toBeGreaterThan(0);
    expect(coinDribblePlugin.settings).toBeDefined();
    expect(typeof coinDribblePlugin.settings).toBe("object");
    expect(typeof coinDribblePlugin.initialState).toBe("function");
    expect(typeof coinDribblePlugin.reducer).toBe("function");
    expect(typeof coinDribblePlugin.isTerminal).toBe("function");
    expect(coinDribblePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = coinDribblePlugin.initialState(42, S);
    const b = coinDribblePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.myScore).toBe(0);
    expect(a.cpuScore).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(coinDribblePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a live state and null when game is over", () => {
    expect(typeof coinDribblePlugin.hint).toBe("function");
    const state = coinDribblePlugin.initialState(7, S);
    const result = coinDribblePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-coin-dribble-pub-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Forcing `done` phase must drive hint to the null branch.
    const finished: CoinDribblePubState = { ...state, phase: "done" };
    expect(coinDribblePlugin.hint!(finished)).toBeNull();
  });
});
