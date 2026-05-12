import { describe, it, expect } from "vitest";
import { diceStackMiniPlugin } from "./index.js";
import type { DiceStackMiniState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-stack-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceStackMiniPlugin.id).toBe("dice-stack-mini");
    expect(diceStackMiniPlugin.title).toBe("Dice Stack Mini");
    expect(diceStackMiniPlugin.category).toBe("dice");
    expect(diceStackMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceStackMiniPlugin.description).toBe("string");
    expect(diceStackMiniPlugin.description.length).toBeGreaterThan(0);
    expect(diceStackMiniPlugin.settings).toBeDefined();
    expect(typeof diceStackMiniPlugin.settings).toBe("object");
    expect(typeof diceStackMiniPlugin.initialState).toBe("function");
    expect(typeof diceStackMiniPlugin.reducer).toBe("function");
    expect(typeof diceStackMiniPlugin.isTerminal).toBe("function");
    expect(diceStackMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceStackMiniPlugin.initialState(42, S);
    const b = diceStackMiniPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.newDie).toBeNull();
    expect(a.stackSize).toBe(0);
    expect(diceStackMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null when terminal", () => {
    expect(typeof diceStackMiniPlugin.hint).toBe("function");
    const fresh = diceStackMiniPlugin.initialState(7, S);
    const rollingHint = diceStackMiniPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-stack-mini-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const scoredState: DiceStackMiniState = { ...fresh, phase: "scored", newDie: 4, lastPts: 24 };
    const scoredHint = diceStackMiniPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-stack-mini-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: DiceStackMiniState = { ...fresh, phase: "done" };
    expect(diceStackMiniPlugin.hint!(doneState)).toBeNull();
    expect(diceStackMiniPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
