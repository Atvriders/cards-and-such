import { describe, it, expect } from "vitest";
import { diceKegelnPlugin } from "./index.js";
import type { DiceKegelnState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-kegeln plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceKegelnPlugin.id).toBe("dice-kegeln");
    expect(diceKegelnPlugin.title).toBe("Dice Kegeln");
    expect(diceKegelnPlugin.category).toBe("dice");
    expect(diceKegelnPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceKegelnPlugin.description).toBe("string");
    expect(diceKegelnPlugin.description.length).toBeGreaterThan(0);
    expect(diceKegelnPlugin.settings).toBeDefined();
    expect(typeof diceKegelnPlugin.settings).toBe("object");
    expect(typeof diceKegelnPlugin.initialState).toBe("function");
    expect(typeof diceKegelnPlugin.reducer).toBe("function");
    expect(typeof diceKegelnPlugin.isTerminal).toBe("function");
    expect(diceKegelnPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceKegelnPlugin.initialState(123, S);
    const b = diceKegelnPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(123);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceKegelnPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof diceKegelnPlugin.hint).toBe("function");

    // Fresh state -> rolling phase -> roll hint selector.
    const rolling = diceKegelnPlugin.initialState(7, S);
    const rollingHint = diceKegelnPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-kegeln-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // After a roll the phase becomes "rolled" (unless final round) -> next hint selector.
    const rolledState: DiceKegelnState = { ...rolling, phase: "rolled" };
    const rolledHint = diceKegelnPlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-kegeln-next"]');
    expect(rolledHint!.pulses).toBe(3);

    // Terminal phase -> hint must be null.
    const doneState: DiceKegelnState = { ...rolling, phase: "done" };
    expect(diceKegelnPlugin.isTerminal(doneState)).toEqual({ score: 0 });
    expect(diceKegelnPlugin.hint!(doneState)).toBeNull();
  });
});
