import { describe, it, expect } from "vitest";
import { dicePyramidPlugin } from "./index.js";
import type { DicePyramidState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-pyramid plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePyramidPlugin.id).toBe("dice-pyramid");
    expect(dicePyramidPlugin.title).toBe("Dice Pyramid");
    expect(dicePyramidPlugin.category).toBe("dice");
    expect(dicePyramidPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePyramidPlugin.description).toBe("string");
    expect(dicePyramidPlugin.description.length).toBeGreaterThan(0);
    expect(dicePyramidPlugin.settings).toBeDefined();
    expect(typeof dicePyramidPlugin.settings).toBe("object");
    expect(typeof dicePyramidPlugin.initialState).toBe("function");
    expect(typeof dicePyramidPlugin.reducer).toBe("function");
    expect(typeof dicePyramidPlugin.isTerminal).toBe("function");
    expect(dicePyramidPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = dicePyramidPlugin.initialState(42, S);
    const b = dicePyramidPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.sum).toBe(0);
    expect(a.ones).toBe(0);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(dicePyramidPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector in active phases, and null when done", () => {
    expect(typeof dicePyramidPlugin.hint).toBe("function");

    const rolling = dicePyramidPlugin.initialState(7, S);
    const rollHint = dicePyramidPlugin.hint!(rolling);
    expect(rollHint).not.toBeNull();
    expect(typeof rollHint!.selector).toBe("string");
    expect(rollHint!.selector.length).toBeGreaterThan(0);
    expect(rollHint!.selector).toContain("dice-pyramid-roll");
    if (rollHint!.pulses !== undefined) {
      expect(typeof rollHint!.pulses).toBe("number");
      expect(rollHint!.pulses).toBeGreaterThan(0);
    }

    const scored: DicePyramidState = { ...rolling, phase: "scored" };
    const nextHint = dicePyramidPlugin.hint!(scored);
    expect(nextHint).not.toBeNull();
    expect(nextHint!.selector).toContain("dice-pyramid-next");

    const done: DicePyramidState = { ...rolling, phase: "done" };
    expect(dicePyramidPlugin.hint!(done)).toBeNull();
    expect(dicePyramidPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
