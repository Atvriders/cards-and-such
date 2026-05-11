import { describe, it, expect } from "vitest";
import { diceDuckpinPlugin } from "./index.js";
import type { DiceDuckpinState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-duckpin plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceDuckpinPlugin.id).toBe("dice-duckpin");
    expect(diceDuckpinPlugin.title).toBe("Dice Duckpin Bowling");
    expect(diceDuckpinPlugin.category).toBe("dice");
    expect(diceDuckpinPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceDuckpinPlugin.description).toBe("string");
    expect(diceDuckpinPlugin.description.length).toBeGreaterThan(0);
    expect(diceDuckpinPlugin.settings).toBeDefined();
    expect(typeof diceDuckpinPlugin.settings).toBe("object");
    expect(typeof diceDuckpinPlugin.initialState).toBe("function");
    expect(typeof diceDuckpinPlugin.reducer).toBe("function");
    expect(typeof diceDuckpinPlugin.isTerminal).toBe("function");
    expect(diceDuckpinPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceDuckpinPlugin.initialState(42, S);
    const b = diceDuckpinPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceDuckpinPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each non-terminal phase and null when terminal", () => {
    expect(typeof diceDuckpinPlugin.hint).toBe("function");
    const fresh = diceDuckpinPlugin.initialState(7, S);
    const rollingHint = diceDuckpinPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-duckpin-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DiceDuckpinState = { ...fresh, phase: "rolled" };
    const rolledHint = diceDuckpinPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-duckpin-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceDuckpinState = { ...fresh, phase: "done", score: 42 };
    expect(diceDuckpinPlugin.hint!(done)).toBeNull();
    expect(diceDuckpinPlugin.isTerminal(done)).toEqual({ score: 42 });
  });
});
