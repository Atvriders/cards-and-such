import { describe, it, expect } from "vitest";
import { cosmicDicePlugin } from "./index.js";
import type { CosmicDiceState } from "./state.js";

describe("cosmic-dice plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cosmicDicePlugin.id).toBe("cosmic-dice");
    expect(cosmicDicePlugin.title).toBe("Cosmic Dice");
    expect(cosmicDicePlugin.category).toBe("dice");
    expect(cosmicDicePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cosmicDicePlugin.description).toBe("string");
    expect(cosmicDicePlugin.description.length).toBeGreaterThan(0);
    expect(cosmicDicePlugin.settings).toBeDefined();
    expect(typeof cosmicDicePlugin.settings).toBe("object");
    expect(typeof cosmicDicePlugin.initialState).toBe("function");
    expect(typeof cosmicDicePlugin.reducer).toBe("function");
    expect(typeof cosmicDicePlugin.isTerminal).toBe("function");
    expect(cosmicDicePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const settings = { rounds: "7" as const };
    const a = cosmicDicePlugin.initialState(42, settings);
    const b = cosmicDicePlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.rollsUsed).toBe(0);
    expect(a.dice).toHaveLength(5);
    expect(a.scores).toEqual({});
    expect(cosmicDicePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playable and null when terminal", () => {
    expect(typeof cosmicDicePlugin.hint).toBe("function");
    const settings = { rounds: "5" as const };
    const fresh = cosmicDicePlugin.initialState(7, settings);

    // Fresh state: rollsUsed < 3, hint should point at the roll button.
    const rollHint = cosmicDicePlugin.hint!(fresh);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-cosmic-dice-roll"]');
    expect(rollHint!.pulses).toBe(3);

    // After 3 rolls with all categories still unused, hint should pick a category.
    const afterRolls: CosmicDiceState = { ...fresh, rollsUsed: 3 };
    const catHint = cosmicDicePlugin.hint!(afterRolls);
    expect(catHint).not.toBeNull();
    expect(catHint!.selector).toMatch(/^\[data-testid="hint-target-cosmic-dice-cat-/);
    expect(catHint!.pulses).toBe(3);

    // All categories scored and rounds exhausted: isTerminal -> hint returns null.
    const terminal: CosmicDiceState = {
      ...fresh,
      round: 6,
      rollsUsed: 3,
      scores: {
        nebula: 0,
        supernova: 0,
        blackhole: 0,
        galaxy: 0,
        comet: 0,
        asteroid: 0,
        cosmos: 0,
      },
    };
    expect(cosmicDicePlugin.isTerminal(terminal)).not.toBeNull();
    expect(cosmicDicePlugin.hint!(terminal)).toBeNull();
  });
});
