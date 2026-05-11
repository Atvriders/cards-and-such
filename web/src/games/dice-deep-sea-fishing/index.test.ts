import { describe, it, expect } from "vitest";
import { diceDeepSeaFishingPlugin } from "./index.js";
import type { DiceDeepSeaFishingState } from "./state.js";

const S = { dummy: true } as const;

describe("dice-deep-sea-fishing plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceDeepSeaFishingPlugin.id).toBe("dice-deep-sea-fishing");
    expect(diceDeepSeaFishingPlugin.title).toBe("Dice Deep-Sea Fishing");
    expect(diceDeepSeaFishingPlugin.category).toBe("dice");
    expect(diceDeepSeaFishingPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceDeepSeaFishingPlugin.description).toBe("string");
    expect(diceDeepSeaFishingPlugin.description.length).toBeGreaterThan(0);
    expect(diceDeepSeaFishingPlugin.settings).toBeDefined();
    expect(typeof diceDeepSeaFishingPlugin.settings).toBe("object");
    expect(typeof diceDeepSeaFishingPlugin.initialState).toBe("function");
    expect(typeof diceDeepSeaFishingPlugin.reducer).toBe("function");
    expect(typeof diceDeepSeaFishingPlugin.isTerminal).toBe("function");
    expect(diceDeepSeaFishingPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = diceDeepSeaFishingPlugin.initialState(123, S);
    const b = diceDeepSeaFishingPlugin.initialState(123, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.rngSeed).toBe(123);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(a.fish).toBe(0);
    expect(diceDeepSeaFishingPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceDeepSeaFishingPlugin.hint).toBe("function");
    const state = diceDeepSeaFishingPlugin.initialState(7, S);

    // Fresh state -> rolling phase -> should return the roll hint target.
    const rollingHint = diceDeepSeaFishingPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-deep-sea-fishing-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // Synthesise a "rolled" phase to exercise the next-hint branch.
    const rolled: DiceDeepSeaFishingState = { ...state, phase: "rolled" };
    const rolledHint = diceDeepSeaFishingPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-deep-sea-fishing-next"]');
    expect(rolledHint!.pulses).toBe(3);

    // Terminal state -> hint must be null.
    const done: DiceDeepSeaFishingState = { ...state, phase: "done" };
    expect(diceDeepSeaFishingPlugin.isTerminal(done)).not.toBeNull();
    expect(diceDeepSeaFishingPlugin.hint!(done)).toBeNull();
  });
});
