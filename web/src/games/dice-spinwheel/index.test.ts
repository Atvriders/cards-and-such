import { describe, it, expect } from "vitest";
import { diceSpinwheelPlugin } from "./index.js";
import type { DiceSpinwheelState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-spinwheel plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSpinwheelPlugin.id).toBe("dice-spinwheel");
    expect(diceSpinwheelPlugin.title).toBe("Dice Spinwheel");
    expect(diceSpinwheelPlugin.category).toBe("dice");
    expect(diceSpinwheelPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSpinwheelPlugin.description).toBe("string");
    expect(diceSpinwheelPlugin.description.length).toBeGreaterThan(0);
    expect(diceSpinwheelPlugin.settings).toBeDefined();
    expect(typeof diceSpinwheelPlugin.settings).toBe("object");
    expect(typeof diceSpinwheelPlugin.initialState).toBe("function");
    expect(typeof diceSpinwheelPlugin.reducer).toBe("function");
    expect(typeof diceSpinwheelPlugin.isTerminal).toBe("function");
    expect(diceSpinwheelPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = diceSpinwheelPlugin.initialState(42, S);
    const b = diceSpinwheelPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(diceSpinwheelPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceSpinwheelPlugin.hint).toBe("function");

    const fresh = diceSpinwheelPlugin.initialState(7, S);
    const rollingHint = diceSpinwheelPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-spinwheel-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolledState: DiceSpinwheelState = { ...fresh, phase: "rolled", dice: [5], lastPts: 20, score: 20 };
    const rolledHint = diceSpinwheelPlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-spinwheel-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const doneState: DiceSpinwheelState = { ...fresh, phase: "done", round: 10, score: 120 };
    expect(diceSpinwheelPlugin.hint!(doneState)).toBeNull();
  });
});
