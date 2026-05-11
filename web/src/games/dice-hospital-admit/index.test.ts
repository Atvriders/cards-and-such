import { describe, it, expect } from "vitest";
import { diceHospitalAdmitPlugin } from "./index.js";
import type { DiceHospitalAdmitState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-hospital-admit plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceHospitalAdmitPlugin.id).toBe("dice-hospital-admit");
    expect(diceHospitalAdmitPlugin.title).toBe("Dice Hospital Admit");
    expect(diceHospitalAdmitPlugin.category).toBe("dice");
    expect(diceHospitalAdmitPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceHospitalAdmitPlugin.description).toBe("string");
    expect(diceHospitalAdmitPlugin.description.length).toBeGreaterThan(0);
    expect(diceHospitalAdmitPlugin.settings).toBeDefined();
    expect(typeof diceHospitalAdmitPlugin.settings).toBe("object");
    expect(typeof diceHospitalAdmitPlugin.initialState).toBe("function");
    expect(typeof diceHospitalAdmitPlugin.reducer).toBe("function");
    expect(typeof diceHospitalAdmitPlugin.isTerminal).toBe("function");
    expect(diceHospitalAdmitPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceHospitalAdmitPlugin.initialState(42, S);
    const b = diceHospitalAdmitPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.lastRoll).toEqual([]);
    expect(a.lastGain).toBe(0);
    expect(a.phase).toBe("ready");
    expect(diceHospitalAdmitPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each phase and isTerminal reflects gameover", () => {
    expect(typeof diceHospitalAdmitPlugin.hint).toBe("function");
    const fresh = diceHospitalAdmitPlugin.initialState(7, S);

    const readyHint = diceHospitalAdmitPlugin.hint!(fresh);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-dice-hospital-admit-roll"]');
    expect(readyHint!.pulses).toBe(3);

    const rolled: DiceHospitalAdmitState = { ...fresh, phase: "rolled" };
    const rolledHint = diceHospitalAdmitPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    // "rolled" is not in the phase whitelist, so falls through to default "roll" target
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-hospital-admit-roll"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceHospitalAdmitState = { ...fresh, phase: "gameover", score: 99 };
    const doneHint = diceHospitalAdmitPlugin.hint!(done);
    expect(doneHint).not.toBeNull();
    expect(doneHint!.selector).toBe('[data-testid="hint-target-dice-hospital-admit-roll"]');
    expect(diceHospitalAdmitPlugin.isTerminal(done)).toEqual({ score: 99 });
  });
});
