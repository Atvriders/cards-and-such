import { describe, it, expect } from "vitest";
import { diceBoccePlugin } from "./index.js";
import type { DiceBocceSettings, DiceBocceState } from "./state.js";

const S: DiceBocceSettings = { dummy: true };

describe("diceBoccePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(diceBoccePlugin.id).toBe("dice-bocce");
    expect(diceBoccePlugin.title).toBe("Dice Bocce");
    expect(diceBoccePlugin.category).toBe("dice");
    expect(diceBoccePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBoccePlugin.description).toBe("string");
    expect(diceBoccePlugin.description.length).toBeGreaterThan(0);
    expect(diceBoccePlugin.settings).toBeDefined();
    expect(diceBoccePlugin.settings.dummy.kind).toBe("boolean");
    expect(diceBoccePlugin.settings.dummy.default).toBe(true);
    expect(typeof diceBoccePlugin.initialState).toBe("function");
    expect(typeof diceBoccePlugin.reducer).toBe("function");
    expect(typeof diceBoccePlugin.isTerminal).toBe("function");
    expect(typeof diceBoccePlugin.hint).toBe("function");
    expect(diceBoccePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = diceBoccePlugin.initialState(42, S);
    const b = diceBoccePlugin.initialState(42, S);
    const c = diceBoccePlugin.initialState(43, S);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(a.myStone).toBe(0);
    expect(a.cpuStone).toBe(0);
    // same seed -> structurally equal
    expect(b).toEqual(a);
    // different seed -> different rngSeed stored
    expect(c.rngSeed).toBe(43);
    expect(c.rngSeed).not.toBe(a.rngSeed);
    expect(diceBoccePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling/rolled and null when terminal/done", () => {
    const rolling = diceBoccePlugin.initialState(7, S);
    const rollTarget = diceBoccePlugin.hint!(rolling);
    expect(rollTarget).not.toBeNull();
    expect(rollTarget!.selector).toBe('[data-testid="hint-target-dice-bocce-roll"]');
    expect(rollTarget!.pulses).toBe(3);

    const rolled: DiceBocceState = { ...rolling, phase: "rolled" };
    const nextTarget = diceBoccePlugin.hint!(rolled);
    expect(nextTarget).not.toBeNull();
    expect(nextTarget!.selector).toBe('[data-testid="hint-target-dice-bocce-next"]');
    expect(nextTarget!.pulses).toBe(3);

    const done: DiceBocceState = { ...rolling, phase: "done" };
    expect(diceBoccePlugin.hint!(done)).toBeNull();
    expect(diceBoccePlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
