import { describe, it, expect } from "vitest";
import { barDiceShipCaptainPlugin } from "./index.js";
import type { BarDiceShipCaptainState } from "./state.js";

const S = { dummy: true } as never;

describe("bar-dice-ship-captain plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(barDiceShipCaptainPlugin.id).toBe("bar-dice-ship-captain");
    expect(barDiceShipCaptainPlugin.title).toBe("Ship, Captain & Crew");
    expect(barDiceShipCaptainPlugin.category).toBe("dice");
    expect(barDiceShipCaptainPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof barDiceShipCaptainPlugin.description).toBe("string");
    expect(barDiceShipCaptainPlugin.description.length).toBeGreaterThan(0);
    expect(barDiceShipCaptainPlugin.settings).toBeDefined();
    expect(typeof barDiceShipCaptainPlugin.settings).toBe("object");
    expect(typeof barDiceShipCaptainPlugin.initialState).toBe("function");
    expect(typeof barDiceShipCaptainPlugin.reducer).toBe("function");
    expect(typeof barDiceShipCaptainPlugin.isTerminal).toBe("function");
    expect(barDiceShipCaptainPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = barDiceShipCaptainPlugin.initialState(42, S);
    const b = barDiceShipCaptainPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.ship).toBe(false);
    expect(a.captain).toBe(false);
    expect(a.crew).toBe(false);
    expect(a.rolls).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(barDiceShipCaptainPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof barDiceShipCaptainPlugin.hint).toBe("function");
    const state = barDiceShipCaptainPlugin.initialState(7, S);

    // Fresh state is in "rolling" phase -> hint should target the roll button.
    const rollingHint = barDiceShipCaptainPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    expect(typeof rollingHint!.selector).toBe("string");
    expect(rollingHint!.selector.length).toBeGreaterThan(0);
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-bar-dice-ship-captain-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // Force "rolled" phase -> hint targets the next button.
    const rolled: BarDiceShipCaptainState = { ...state, phase: "rolled" };
    const rolledHint = barDiceShipCaptainPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-bar-dice-ship-captain-next"]');
    expect(rolledHint!.pulses).toBe(3);

    // Force "done" phase -> isTerminal returns non-null, hint returns null.
    const done: BarDiceShipCaptainState = { ...state, phase: "done", score: 10 };
    expect(barDiceShipCaptainPlugin.isTerminal(done)).toEqual({ score: 10 });
    expect(barDiceShipCaptainPlugin.hint!(done)).toBeNull();
  });
});
