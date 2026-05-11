import { describe, it, expect } from "vitest";
import { diceFormulaDePlugin } from "./index.js";
import type { DiceFormulaDeState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-formula-de plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFormulaDePlugin.id).toBe("dice-formula-de");
    expect(diceFormulaDePlugin.title).toBe("Dice Formula Dé");
    expect(diceFormulaDePlugin.category).toBe("dice");
    expect(diceFormulaDePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFormulaDePlugin.description).toBe("string");
    expect(diceFormulaDePlugin.description.length).toBeGreaterThan(0);
    expect(diceFormulaDePlugin.settings).toBeDefined();
    expect(typeof diceFormulaDePlugin.settings).toBe("object");
    expect(typeof diceFormulaDePlugin.initialState).toBe("function");
    expect(typeof diceFormulaDePlugin.reducer).toBe("function");
    expect(typeof diceFormulaDePlugin.isTerminal).toBe("function");
    expect(diceFormulaDePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceFormulaDePlugin.initialState(42, S);
    const b = diceFormulaDePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.myPos).toBe(0);
    expect(a.cpuPos).toEqual([0, 0, 0]);
    expect(a.phase).toBe("rolling");
    expect(a.dice).toBeNull();
    expect(diceFormulaDePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof diceFormulaDePlugin.hint).toBe("function");
    const rolling = diceFormulaDePlugin.initialState(7, S);
    const rollHint = diceFormulaDePlugin.hint!(rolling);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-formula-de-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const rolled: DiceFormulaDeState = { ...rolling, phase: "rolled" };
    const nextHint = diceFormulaDePlugin.hint!(rolled);
    expect(nextHint).not.toBeNull();
    expect(nextHint!.selector).toBe('[data-testid="hint-target-dice-formula-de-next"]');
    expect(nextHint!.pulses).toBe(3);

    const done: DiceFormulaDeState = { ...rolling, phase: "done" };
    expect(diceFormulaDePlugin.isTerminal(done)).not.toBeNull();
    expect(diceFormulaDePlugin.hint!(done)).toBeNull();
  });
});
