import { describe, it, expect } from "vitest";
import { dice701Plugin } from "./index.js";
import type { Dice701Settings, Dice701State } from "./state.js";

const S: Dice701Settings = { dummy: true };

describe("dice701Plugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(dice701Plugin.id).toBe("dice-701");
    expect(dice701Plugin.title).toBe("Dice 701");
    expect(dice701Plugin.category).toBe("dice");
    expect(dice701Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dice701Plugin.description).toBe("string");
    expect(dice701Plugin.description.length).toBeGreaterThan(0);
    expect(dice701Plugin.settings).toBeDefined();
    expect(dice701Plugin.settings.dummy.kind).toBe("boolean");
    expect(dice701Plugin.settings.dummy.default).toBe(true);
    expect(typeof dice701Plugin.initialState).toBe("function");
    expect(typeof dice701Plugin.reducer).toBe("function");
    expect(typeof dice701Plugin.isTerminal).toBe("function");
    expect(typeof dice701Plugin.hint).toBe("function");
    expect(dice701Plugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = dice701Plugin.initialState(42, S);
    const b = dice701Plugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(a.remaining).toBe(701);
    expect(a.busts).toBe(0);
    expect(a.finished).toBe(false);
    expect(dice701Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling/rolled and null when done", () => {
    const rolling = dice701Plugin.initialState(7, S);
    const rollingTarget = dice701Plugin.hint!(rolling);
    expect(rollingTarget).not.toBeNull();
    expect(rollingTarget!.selector).toBe('[data-testid="hint-target-dice-701-roll"]');
    expect(rollingTarget!.pulses).toBe(3);

    const rolled: Dice701State = { ...rolling, phase: "rolled" };
    const rolledTarget = dice701Plugin.hint!(rolled);
    expect(rolledTarget).not.toBeNull();
    expect(rolledTarget!.selector).toBe('[data-testid="hint-target-dice-701-next"]');
    expect(rolledTarget!.pulses).toBe(3);

    const done: Dice701State = { ...rolling, phase: "done" };
    expect(dice701Plugin.hint!(done)).toBeNull();
  });
});
