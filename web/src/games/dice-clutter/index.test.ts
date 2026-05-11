import { describe, it, expect } from "vitest";
import { diceClutterPlugin } from "./index.js";
import type { DiceClutterState } from "./state.js";

const S = { dummy: false };

describe("dice-clutter plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceClutterPlugin.id).toBe("dice-clutter");
    expect(diceClutterPlugin.title).toBe("Dice Clutter");
    expect(diceClutterPlugin.category).toBe("dice");
    expect(diceClutterPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceClutterPlugin.description).toBe("string");
    expect(diceClutterPlugin.description.length).toBeGreaterThan(0);
    expect(diceClutterPlugin.settings).toBeDefined();
    expect(typeof diceClutterPlugin.settings).toBe("object");
    expect(typeof diceClutterPlugin.initialState).toBe("function");
    expect(typeof diceClutterPlugin.reducer).toBe("function");
    expect(typeof diceClutterPlugin.isTerminal).toBe("function");
    expect(diceClutterPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceClutterPlugin.initialState(42, S);
    const b = diceClutterPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("rolling");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toEqual([]);
    expect(diceClutterPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null for done/other", () => {
    expect(typeof diceClutterPlugin.hint).toBe("function");

    // Fresh state is in 'rolling' phase -> hint should target roll button.
    const rolling = diceClutterPlugin.initialState(7, S);
    const rollHint = diceClutterPlugin.hint!(rolling);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-clutter-roll"]');
    expect(rollHint!.pulses).toBe(3);

    // Synthesize a 'scored' phase state -> hint should target next button.
    const scored: DiceClutterState = { ...rolling, phase: "scored" };
    const scoredHint = diceClutterPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-clutter-next"]');
    expect(scoredHint!.pulses).toBe(3);

    // Synthesize a 'done' phase state -> isTerminal non-null, hint returns null.
    const done: DiceClutterState = { ...rolling, phase: "done", score: 123 };
    expect(diceClutterPlugin.isTerminal(done)).toEqual({ score: 123 });
    expect(diceClutterPlugin.hint!(done)).toBeNull();
  });
});
