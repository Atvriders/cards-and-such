import { describe, it, expect } from "vitest";
import { diceNinepinBowlPlugin } from "./index.js";

const S = { dummy: true };

describe("dice-ninepin-bowl plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceNinepinBowlPlugin.id).toBe("dice-ninepin-bowl");
    expect(diceNinepinBowlPlugin.title).toBe("Dice Nine-Pin Bowling");
    expect(diceNinepinBowlPlugin.category).toBe("dice");
    expect(diceNinepinBowlPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceNinepinBowlPlugin.description).toBe("string");
    expect(diceNinepinBowlPlugin.description.length).toBeGreaterThan(0);
    expect(diceNinepinBowlPlugin.settings).toBeDefined();
    expect(typeof diceNinepinBowlPlugin.settings).toBe("object");
    expect(typeof diceNinepinBowlPlugin.initialState).toBe("function");
    expect(typeof diceNinepinBowlPlugin.reducer).toBe("function");
    expect(typeof diceNinepinBowlPlugin.isTerminal).toBe("function");
    expect(diceNinepinBowlPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceNinepinBowlPlugin.initialState(42, S);
    const b = diceNinepinBowlPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(diceNinepinBowlPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof diceNinepinBowlPlugin.hint).toBe("function");

    // Fresh state: phase === "rolling" -> hint targets the roll button.
    const rolling = diceNinepinBowlPlugin.initialState(7, S);
    const rollingHint = diceNinepinBowlPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-ninepin-bowl-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // After a roll: phase === "rolled" -> hint targets the next button.
    const afterRoll = diceNinepinBowlPlugin.reducer(rolling, { type: "roll" });
    if (afterRoll.phase === "rolled") {
      const rolledHint = diceNinepinBowlPlugin.hint!(afterRoll);
      expect(rolledHint).not.toBeNull();
      expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-ninepin-bowl-next"]');
      expect(rolledHint!.pulses).toBe(3);
    }

    // Terminal state: hint must return null.
    const terminal = { ...rolling, phase: "done" as const };
    expect(diceNinepinBowlPlugin.isTerminal(terminal)).not.toBeNull();
    expect(diceNinepinBowlPlugin.hint!(terminal)).toBeNull();
  });
});
