import { describe, it, expect } from "vitest";
import { cragPlugin } from "./index.js";
import type { CragState } from "./state.js";

const S = {} as never;

describe("crag plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cragPlugin.id).toBe("crag");
    expect(cragPlugin.title).toBe("Crag");
    expect(cragPlugin.category).toBe("dice");
    expect(cragPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cragPlugin.description).toBe("string");
    expect(cragPlugin.description.length).toBeGreaterThan(0);
    expect(cragPlugin.settings).toBeDefined();
    expect(typeof cragPlugin.settings).toBe("object");
    expect(typeof cragPlugin.initialState).toBe("function");
    expect(typeof cragPlugin.reducer).toBe("function");
    expect(typeof cragPlugin.isTerminal).toBe("function");
    expect(cragPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = cragPlugin.initialState(42, S);
    const b = cragPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("preRoll");
    expect(a.rollsLeft).toBe(3);
    expect(a.totalScore).toBe(0);
    expect(a.dice).toEqual([1, 1, 1]);
    expect(a.keptMask).toEqual([false, false, false]);
    expect(Object.keys(a.scores)).toHaveLength(0);
    expect(cragPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playable and null when terminal", () => {
    expect(typeof cragPlugin.hint).toBe("function");

    // preRoll phase -> should suggest the roll button
    const preRoll = cragPlugin.initialState(7, S);
    const preRollHint = cragPlugin.hint!(preRoll);
    expect(preRollHint).not.toBeNull();
    expect(preRollHint!.selector).toBe('[data-testid="hint-target-crag-roll"]');
    expect(preRollHint!.pulses).toBe(3);

    // rolled phase with no rolls left -> should suggest a category cell
    const rolled: CragState = {
      ...preRoll,
      phase: "rolled",
      rollsLeft: 0,
      dice: [6, 6, 1],
    };
    const rolledHint = cragPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toMatch(/^\[data-testid="hint-target-crag-cat-/);
    expect(rolledHint!.pulses).toBe(3);

    // rolled phase with rolls left -> still suggests rolling
    const rolledWithRolls: CragState = {
      ...preRoll,
      phase: "rolled",
      rollsLeft: 2,
      dice: [3, 4, 5],
    };
    const rolledRollHint = cragPlugin.hint!(rolledWithRolls);
    expect(rolledRollHint).not.toBeNull();
    expect(rolledRollHint!.selector).toBe('[data-testid="hint-target-crag-roll"]');

    // Terminal game -> hint returns null
    const terminal: CragState = {
      ...preRoll,
      phase: "gameDone",
    };
    expect(cragPlugin.isTerminal(terminal)).toEqual({ score: terminal.totalScore });
    expect(cragPlugin.hint!(terminal)).toBeNull();
  });
});
