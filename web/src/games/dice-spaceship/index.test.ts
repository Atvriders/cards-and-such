import { describe, it, expect } from "vitest";
import { diceSpaceshipPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("dice-spaceship plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSpaceshipPlugin.id).toBe("dice-spaceship");
    expect(diceSpaceshipPlugin.title).toBe("Dice Spaceship");
    expect(diceSpaceshipPlugin.category).toBe("dice");
    expect(diceSpaceshipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSpaceshipPlugin.description).toBe("string");
    expect(diceSpaceshipPlugin.description.length).toBeGreaterThan(0);
    expect(diceSpaceshipPlugin.settings).toBeDefined();
    expect(typeof diceSpaceshipPlugin.settings).toBe("object");
    expect(typeof diceSpaceshipPlugin.initialState).toBe("function");
    expect(typeof diceSpaceshipPlugin.reducer).toBe("function");
    expect(typeof diceSpaceshipPlugin.isTerminal).toBe("function");
    expect(diceSpaceshipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceSpaceshipPlugin.initialState(42, S);
    const b = diceSpaceshipPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("choose");
    expect(a.pos).toBe(0);
    expect(a.score).toBe(0);
    expect(a.rolls).toBeNull();
    expect(diceSpaceshipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for choose/result phases and null when terminal", () => {
    expect(typeof diceSpaceshipPlugin.hint).toBe("function");
    const fresh = diceSpaceshipPlugin.initialState(7, S);

    // Fresh state is in "choose" phase, expect the roll selector.
    const chooseHint = diceSpaceshipPlugin.hint!(fresh);
    expect(chooseHint).not.toBeNull();
    expect(typeof chooseHint!.selector).toBe("string");
    expect(chooseHint!.selector.length).toBeGreaterThan(0);
    expect(chooseHint!.selector).toContain("dice-spaceship");
    if (chooseHint!.pulses !== undefined) {
      expect(typeof chooseHint!.pulses).toBe("number");
      expect(chooseHint!.pulses).toBeGreaterThan(0);
    }

    // Force "result" phase: expect the next selector.
    const resultState = { ...fresh, phase: "result" as const };
    const resultHint = diceSpaceshipPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toContain("dice-spaceship");

    // Force terminal: hint returns null.
    const doneState = { ...fresh, phase: "done" as const };
    expect(diceSpaceshipPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(diceSpaceshipPlugin.hint!(doneState)).toBeNull();
  });
});
