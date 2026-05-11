import { describe, it, expect } from "vitest";
import { diceKanjamPlugin } from "./index.js";
import type { DiceKanjamState, DiceKanjamSettings } from "./state.js";

const S = { dummy: true } as DiceKanjamSettings;

describe("dice-kanjam plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceKanjamPlugin.id).toBe("dice-kanjam");
    expect(diceKanjamPlugin.title).toBe("Dice Kan Jam");
    expect(diceKanjamPlugin.category).toBe("dice");
    expect(diceKanjamPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceKanjamPlugin.description).toBe("string");
    expect(diceKanjamPlugin.description.length).toBeGreaterThan(0);
    expect(diceKanjamPlugin.settings).toBeDefined();
    expect(typeof diceKanjamPlugin.settings).toBe("object");
    expect(typeof diceKanjamPlugin.initialState).toBe("function");
    expect(typeof diceKanjamPlugin.reducer).toBe("function");
    expect(typeof diceKanjamPlugin.isTerminal).toBe("function");
    expect(diceKanjamPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceKanjamPlugin.initialState(42, S);
    const b = diceKanjamPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.cpuScore).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(diceKanjamPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceKanjamPlugin.hint).toBe("function");

    const rolling = diceKanjamPlugin.initialState(7, S);
    const rollingHint = diceKanjamPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-kanjam-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolledState: DiceKanjamState = { ...rolling, phase: "rolled" };
    const rolledHint = diceKanjamPlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-kanjam-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const doneState: DiceKanjamState = { ...rolling, phase: "done" };
    expect(diceKanjamPlugin.hint!(doneState)).toBeNull();
    expect(diceKanjamPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
