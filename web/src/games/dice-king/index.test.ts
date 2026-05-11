import { describe, it, expect } from "vitest";
import { diceKingPlugin } from "./index.js";
import type { DiceKingState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-king plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceKingPlugin.id).toBe("dice-king");
    expect(diceKingPlugin.title).toBe("Dice King");
    expect(diceKingPlugin.category).toBe("dice");
    expect(diceKingPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceKingPlugin.description).toBe("string");
    expect(diceKingPlugin.description.length).toBeGreaterThan(0);
    expect(diceKingPlugin.settings).toBeDefined();
    expect(typeof diceKingPlugin.settings).toBe("object");
    expect(typeof diceKingPlugin.initialState).toBe("function");
    expect(typeof diceKingPlugin.reducer).toBe("function");
    expect(typeof diceKingPlugin.isTerminal).toBe("function");
    expect(diceKingPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null at start", () => {
    const a = diceKingPlugin.initialState(123, S);
    const b = diceKingPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.highestSum).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.dice).toEqual([]);
    expect(a.lastPts).toBe(0);
    expect(diceKingPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null when done", () => {
    expect(typeof diceKingPlugin.hint).toBe("function");
    const fresh = diceKingPlugin.initialState(7, S);

    const rollHint = diceKingPlugin.hint!(fresh);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-king-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const scoredState: DiceKingState = { ...fresh, phase: "scored", dice: [1, 2, 3], lastPts: 6 };
    const nextHint = diceKingPlugin.hint!(scoredState);
    expect(nextHint).not.toBeNull();
    expect(nextHint!.selector).toBe('[data-testid="hint-target-dice-king-next"]');
    expect(nextHint!.pulses).toBe(3);

    const doneState: DiceKingState = { ...fresh, phase: "done" };
    expect(diceKingPlugin.hint!(doneState)).toBeNull();
    expect(diceKingPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
