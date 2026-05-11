import { describe, it, expect } from "vitest";
import { diceForgeCraftPlugin } from "./index.js";
import type { diceForgeCraftState } from "./state.js";

const S = { dummy: false } as const;

describe("dice-forge-craft plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceForgeCraftPlugin.id).toBe("dice-forge-craft");
    expect(diceForgeCraftPlugin.title).toBe("Dice Forge");
    expect(diceForgeCraftPlugin.category).toBe("dice");
    expect(diceForgeCraftPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceForgeCraftPlugin.description).toBe("string");
    expect(diceForgeCraftPlugin.description.length).toBeGreaterThan(0);
    expect(diceForgeCraftPlugin.settings).toBeDefined();
    expect(typeof diceForgeCraftPlugin.settings).toBe("object");
    expect(typeof diceForgeCraftPlugin.initialState).toBe("function");
    expect(typeof diceForgeCraftPlugin.reducer).toBe("function");
    expect(typeof diceForgeCraftPlugin.isTerminal).toBe("function");
    expect(diceForgeCraftPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh forge", () => {
    const a = diceForgeCraftPlugin.initialState(42, S);
    const b = diceForgeCraftPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.cells.length).toBe(16);
    expect(a.cells.every((v) => v === false)).toBe(true);
    expect(a.cellValues.length).toBe(16);
    expect(a.cellValues.every((v) => v === 0)).toBe(true);
    expect(a.rolls).toBe(0);
    expect(a.lastRoll).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(diceForgeCraftPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with the rolling/marking selectors and null when terminal", () => {
    expect(typeof diceForgeCraftPlugin.hint).toBe("function");

    const fresh = diceForgeCraftPlugin.initialState(7, S);
    const rollingHint = diceForgeCraftPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-forge-craft-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const marking: diceForgeCraftState = { ...fresh, phase: "marking", lastRoll: 4 };
    const markingHint = diceForgeCraftPlugin.hint!(marking);
    expect(markingHint).not.toBeNull();
    expect(markingHint!.selector).toBe('[data-testid="hint-target-dice-forge-craft-skip"]');
    expect(markingHint!.pulses).toBe(3);

    const done: diceForgeCraftState = {
      ...fresh,
      phase: "done",
      cells: new Array(16).fill(true),
      cellValues: new Array(16).fill(6),
      rolls: 12,
      score: 24,
    };
    expect(diceForgeCraftPlugin.isTerminal(done)).not.toBeNull();
    expect(diceForgeCraftPlugin.hint!(done)).toBeNull();
  });
});
