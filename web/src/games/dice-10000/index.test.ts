import { describe, it, expect } from "vitest";
import { dice10000Plugin } from "./index.js";
import type { Dice10000State } from "./state.js";

const S = { dummy: false } as const;

describe("dice-10000 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dice10000Plugin.id).toBe("dice-10000");
    expect(dice10000Plugin.title).toBe("Dice 10000");
    expect(dice10000Plugin.category).toBe("dice");
    expect(dice10000Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dice10000Plugin.description).toBe("string");
    expect(dice10000Plugin.description.length).toBeGreaterThan(0);
    expect(dice10000Plugin.settings).toBeDefined();
    expect(typeof dice10000Plugin.settings).toBe("object");
    expect(typeof dice10000Plugin.initialState).toBe("function");
    expect(typeof dice10000Plugin.reducer).toBe("function");
    expect(typeof dice10000Plugin.isTerminal).toBe("function");
    expect(dice10000Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = dice10000Plugin.initialState(42, S);
    const b = dice10000Plugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.dice).toEqual([]);
    expect(dice10000Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for roll/result phases and null when terminal", () => {
    expect(typeof dice10000Plugin.hint).toBe("function");

    const fresh = dice10000Plugin.initialState(7, S);
    const rollHint = dice10000Plugin.hint!(fresh);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-10000-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const resultState: Dice10000State = { ...fresh, phase: "result" };
    const resultHint = dice10000Plugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-10000-next"]');
    expect(resultHint!.pulses).toBe(3);

    const doneState: Dice10000State = { ...fresh, phase: "done" };
    expect(dice10000Plugin.isTerminal(doneState)).toEqual({ score: 0 });
    expect(dice10000Plugin.hint!(doneState)).toBeNull();
  });
});
