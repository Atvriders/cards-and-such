import { describe, it, expect } from "vitest";
import { dicePortalPlugin } from "./index.js";
import type { DicePortalState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-portal plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePortalPlugin.id).toBe("dice-portal");
    expect(dicePortalPlugin.title).toBe("Dice Portal");
    expect(dicePortalPlugin.category).toBe("dice");
    expect(dicePortalPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePortalPlugin.description).toBe("string");
    expect(dicePortalPlugin.description.length).toBeGreaterThan(0);
    expect(dicePortalPlugin.settings).toBeDefined();
    expect(typeof dicePortalPlugin.settings).toBe("object");
    expect(typeof dicePortalPlugin.initialState).toBe("function");
    expect(typeof dicePortalPlugin.reducer).toBe("function");
    expect(typeof dicePortalPlugin.isTerminal).toBe("function");
    expect(dicePortalPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = dicePortalPlugin.initialState(42, S);
    const b = dicePortalPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(dicePortalPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof dicePortalPlugin.hint).toBe("function");
    const fresh = dicePortalPlugin.initialState(7, S);

    // phase === "roll" should point at the roll button.
    const rollHint = dicePortalPlugin.hint!(fresh);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-portal-roll"]');
    expect(rollHint!.pulses).toBe(3);

    // phase === "scored" should point at the next button.
    const scored: DicePortalState = { ...fresh, phase: "scored", dice: [3, 4], lastPts: 14 };
    const scoredHint = dicePortalPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-portal-next"]');
    expect(scoredHint!.pulses).toBe(3);

    // Terminal state should yield null from hint().
    const done: DicePortalState = { ...fresh, phase: "done", score: 100 };
    expect(dicePortalPlugin.isTerminal(done)).toEqual({ score: 100 });
    expect(dicePortalPlugin.hint!(done)).toBeNull();
  });
});
