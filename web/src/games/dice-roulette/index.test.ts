import { describe, it, expect } from "vitest";
import { diceRoulettePlugin } from "./index.js";

const S = { dummy: false } as const;

describe("dice-roulette plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceRoulettePlugin.id).toBe("dice-roulette");
    expect(diceRoulettePlugin.title).toBe("Dice Roulette");
    expect(diceRoulettePlugin.category).toBe("dice");
    expect(diceRoulettePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceRoulettePlugin.description).toBe("string");
    expect(diceRoulettePlugin.description.length).toBeGreaterThan(0);
    expect(diceRoulettePlugin.settings).toBeDefined();
    expect(typeof diceRoulettePlugin.settings).toBe("object");
    expect(typeof diceRoulettePlugin.initialState).toBe("function");
    expect(typeof diceRoulettePlugin.reducer).toBe("function");
    expect(typeof diceRoulettePlugin.isTerminal).toBe("function");
    expect(diceRoulettePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceRoulettePlugin.initialState(1234, S);
    const b = diceRoulettePlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("betting");
    expect(a.score).toBe(0);
    expect(a.bet).toBeNull();
    expect(a.dice).toBeNull();
    expect(diceRoulettePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for live state and null when game is over", () => {
    expect(typeof diceRoulettePlugin.hint).toBe("function");
    const state = diceRoulettePlugin.initialState(7, S);
    const live = diceRoulettePlugin.hint!(state);
    expect(live).not.toBeNull();
    if (live !== null) {
      expect(typeof live.selector).toBe("string");
      expect(live.selector.length).toBeGreaterThan(0);
      expect(live.selector).toBe('[data-testid="hint-target-dice-roulette-roll"]');
      if (live.pulses !== undefined) {
        expect(typeof live.pulses).toBe("number");
        expect(live.pulses).toBeGreaterThan(0);
      }
    }

    // Force the gameover branch via the gameOver flag the hint checks for.
    const done = { ...state, gameOver: true } as unknown as typeof state;
    expect(diceRoulettePlugin.hint!(done)).toBeNull();
  });
});
