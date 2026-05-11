import { describe, it, expect } from "vitest";
import { dicePickupPlugin } from "./index.js";
import { DICE_COUNT } from "./state.js";

const S = { dummy: false } as never;

describe("dice-pickup plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePickupPlugin.id).toBe("dice-pickup");
    expect(dicePickupPlugin.title).toBe("Dice Pickup");
    expect(dicePickupPlugin.category).toBe("dice");
    expect(dicePickupPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePickupPlugin.description).toBe("string");
    expect(dicePickupPlugin.description.length).toBeGreaterThan(0);
    expect(dicePickupPlugin.settings).toBeDefined();
    expect(typeof dicePickupPlugin.settings).toBe("object");
    expect(typeof dicePickupPlugin.initialState).toBe("function");
    expect(typeof dicePickupPlugin.reducer).toBe("function");
    expect(typeof dicePickupPlugin.isTerminal).toBe("function");
    expect(dicePickupPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = dicePickupPlugin.initialState(42, S);
    const b = dicePickupPlugin.initialState(42, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.target).toBe(b.target);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("picking");
    expect(a.dice).toHaveLength(DICE_COUNT);
    expect(a.picked).toHaveLength(DICE_COUNT);
    expect(a.picked.every((p) => p === false)).toBe(true);
    expect(a.target).toBeGreaterThanOrEqual(1);
    expect(a.target).toBeLessThanOrEqual(6);
    for (const face of a.dice) {
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(6);
    }
    expect(dicePickupPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while picking and null when game is over", () => {
    expect(typeof dicePickupPlugin.hint).toBe("function");
    const state = dicePickupPlugin.initialState(5, S);
    const result = dicePickupPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-pickup-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force gameover phase -> hint returns null.
    const over = { ...state, phase: "gameover" as unknown as typeof state.phase };
    expect(dicePickupPlugin.hint!(over)).toBeNull();

    // Also covers the `gameOver` truthy branch.
    const overFlag = { ...state, gameOver: true } as unknown as typeof state;
    expect(dicePickupPlugin.hint!(overFlag)).toBeNull();
  });
});
