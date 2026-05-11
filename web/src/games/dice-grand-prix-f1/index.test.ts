import { describe, it, expect } from "vitest";
import { diceGrandPrixF1Plugin } from "./index.js";

describe("dice-grand-prix-f1 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceGrandPrixF1Plugin.id).toBe("dice-grand-prix-f1");
    expect(diceGrandPrixF1Plugin.title).toBe("Dice Grand Prix F1");
    expect(diceGrandPrixF1Plugin.category).toBe("dice");
    expect(diceGrandPrixF1Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceGrandPrixF1Plugin.initialState).toBe("function");
    expect(typeof diceGrandPrixF1Plugin.reducer).toBe("function");
    expect(typeof diceGrandPrixF1Plugin.isTerminal).toBe("function");
    expect(typeof diceGrandPrixF1Plugin.hint).toBe("function");
    expect(diceGrandPrixF1Plugin.settings).toBeDefined();
    expect(diceGrandPrixF1Plugin.component).toBeDefined();
  });

  it("produces a deterministic initial state with isTerminal null", () => {
    const a = diceGrandPrixF1Plugin.initialState(12345, { dummy: true });
    const b = diceGrandPrixF1Plugin.initialState(12345, { dummy: true });
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(12345);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.myPos).toBe(0);
    expect(a.cpuPos).toEqual([0, 0, 0]);
    expect(a.dice).toBeNull();
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceGrandPrixF1Plugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget while in play and null when terminal", () => {
    const s = diceGrandPrixF1Plugin.initialState(7, { dummy: true });
    const rollingHint = diceGrandPrixF1Plugin.hint!(s);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toContain("dice-grand-prix-f1-roll");
    expect(rollingHint!.pulses).toBe(3);

    const afterRoll = diceGrandPrixF1Plugin.reducer(s, { type: "roll" });
    if (afterRoll.phase === "rolled") {
      const rolledHint = diceGrandPrixF1Plugin.hint!(afterRoll);
      expect(rolledHint).not.toBeNull();
      expect(rolledHint!.selector).toContain("dice-grand-prix-f1-next");
    }

    const doneState = { ...s, phase: "done" as const };
    expect(diceGrandPrixF1Plugin.hint!(doneState)).toBeNull();
    expect(diceGrandPrixF1Plugin.isTerminal!(doneState)).toEqual({ score: 0 });
  });
});
