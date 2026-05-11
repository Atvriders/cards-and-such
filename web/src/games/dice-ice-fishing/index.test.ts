import { describe, it, expect } from "vitest";
import { diceIceFishingPlugin } from "./index.js";
import type { DiceIceFishingState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-ice-fishing plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceIceFishingPlugin.id).toBe("dice-ice-fishing");
    expect(diceIceFishingPlugin.title).toBe("Dice Ice Fishing");
    expect(diceIceFishingPlugin.category).toBe("dice");
    expect(diceIceFishingPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceIceFishingPlugin.description).toBe("string");
    expect(diceIceFishingPlugin.description.length).toBeGreaterThan(0);
    expect(diceIceFishingPlugin.settings).toBeDefined();
    expect(typeof diceIceFishingPlugin.settings).toBe("object");
    expect(typeof diceIceFishingPlugin.initialState).toBe("function");
    expect(typeof diceIceFishingPlugin.reducer).toBe("function");
    expect(typeof diceIceFishingPlugin.isTerminal).toBe("function");
    expect(diceIceFishingPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceIceFishingPlugin.initialState(42, S);
    const b = diceIceFishingPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.fish).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceIceFishingPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each non-terminal phase and null when terminal", () => {
    expect(typeof diceIceFishingPlugin.hint).toBe("function");
    const fresh = diceIceFishingPlugin.initialState(7, S);
    const rollingHint = diceIceFishingPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-ice-fishing-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DiceIceFishingState = { ...fresh, phase: "rolled" };
    const rolledHint = diceIceFishingPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-ice-fishing-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceIceFishingState = { ...fresh, phase: "done", score: 42 };
    expect(diceIceFishingPlugin.hint!(done)).toBeNull();
    expect(diceIceFishingPlugin.isTerminal(done)).toEqual({ score: 42 });
  });
});
