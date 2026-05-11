import { describe, it, expect } from "vitest";
import { diceRainbowPlugin } from "./index.js";
import type { DiceRainbowState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-rainbow plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceRainbowPlugin.id).toBe("dice-rainbow");
    expect(diceRainbowPlugin.title).toBe("Dice Rainbow");
    expect(diceRainbowPlugin.category).toBe("dice");
    expect(diceRainbowPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceRainbowPlugin.description).toBe("string");
    expect(diceRainbowPlugin.description.length).toBeGreaterThan(0);
    expect(diceRainbowPlugin.settings).toBeDefined();
    expect(typeof diceRainbowPlugin.settings).toBe("object");
    expect(typeof diceRainbowPlugin.initialState).toBe("function");
    expect(typeof diceRainbowPlugin.reducer).toBe("function");
    expect(typeof diceRainbowPlugin.isTerminal).toBe("function");
    expect(diceRainbowPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceRainbowPlugin.initialState(42, S);
    const b = diceRainbowPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.lastPts).toBe(0);
    expect(diceRainbowPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each non-terminal phase and null when terminal", () => {
    expect(typeof diceRainbowPlugin.hint).toBe("function");
    const fresh = diceRainbowPlugin.initialState(7, S);
    const rollingHint = diceRainbowPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-rainbow-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const result: DiceRainbowState = { ...fresh, phase: "result" };
    const resultHint = diceRainbowPlugin.hint!(result);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-rainbow-next"]');
    expect(resultHint!.pulses).toBe(3);

    const done: DiceRainbowState = { ...fresh, phase: "done", score: 100 };
    expect(diceRainbowPlugin.hint!(done)).toBeNull();
    expect(diceRainbowPlugin.isTerminal(done)).toEqual({ score: 100 });
  });
});
