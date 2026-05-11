import { describe, it, expect } from "vitest";
import { diceAroundClockPlugin } from "./index.js";
import type { DiceAroundClockState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-around-clock plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceAroundClockPlugin.id).toBe("dice-around-clock");
    expect(diceAroundClockPlugin.title).toBe("Dice Around the Clock");
    expect(diceAroundClockPlugin.category).toBe("dice");
    expect(diceAroundClockPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceAroundClockPlugin.description).toBe("string");
    expect(diceAroundClockPlugin.description.length).toBeGreaterThan(0);
    expect(diceAroundClockPlugin.settings).toBeDefined();
    expect(typeof diceAroundClockPlugin.settings).toBe("object");
    expect(typeof diceAroundClockPlugin.initialState).toBe("function");
    expect(typeof diceAroundClockPlugin.reducer).toBe("function");
    expect(typeof diceAroundClockPlugin.isTerminal).toBe("function");
    expect(diceAroundClockPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = diceAroundClockPlugin.initialState(123, S);
    const b = diceAroundClockPlugin.initialState(123, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.round).toBe(1);
    expect(a.phase).toBe("rolling");
    expect(a.target).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(diceAroundClockPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceAroundClockPlugin.hint).toBe("function");
    const state = diceAroundClockPlugin.initialState(7, S);

    // Fresh state -> rolling phase -> should return the roll hint target.
    const rollingHint = diceAroundClockPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-around-clock-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // Synthesise a "rolled" phase to exercise the next-hint branch.
    const rolled: DiceAroundClockState = { ...state, phase: "rolled" };
    const rolledHint = diceAroundClockPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-around-clock-next"]');
    expect(rolledHint!.pulses).toBe(3);

    // Terminal state -> hint must be null.
    const done: DiceAroundClockState = { ...state, phase: "done" };
    expect(diceAroundClockPlugin.isTerminal(done)).not.toBeNull();
    expect(diceAroundClockPlugin.hint!(done)).toBeNull();
  });
});
