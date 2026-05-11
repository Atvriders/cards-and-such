import { describe, it, expect } from "vitest";
import { dicePetanquePlugin } from "./index.js";
import type { DicePetanqueState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-petanque plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dicePetanquePlugin.id).toBe("dice-petanque");
    expect(dicePetanquePlugin.title).toBe("Dice Petanque");
    expect(dicePetanquePlugin.category).toBe("dice");
    expect(dicePetanquePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dicePetanquePlugin.description).toBe("string");
    expect(dicePetanquePlugin.description.length).toBeGreaterThan(0);
    expect(dicePetanquePlugin.settings).toBeDefined();
    expect(typeof dicePetanquePlugin.settings).toBe("object");
    expect(typeof dicePetanquePlugin.initialState).toBe("function");
    expect(typeof dicePetanquePlugin.reducer).toBe("function");
    expect(typeof dicePetanquePlugin.isTerminal).toBe("function");
    expect(dicePetanquePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = dicePetanquePlugin.initialState(123, S);
    const b = dicePetanquePlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(123);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.myStone).toBe(0);
    expect(a.cpuStone).toBe(0);
    expect(dicePetanquePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each non-terminal phase and null when terminal", () => {
    expect(typeof dicePetanquePlugin.hint).toBe("function");
    const fresh = dicePetanquePlugin.initialState(11, S);
    const rollingHint = dicePetanquePlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-petanque-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DicePetanqueState = { ...fresh, phase: "rolled" };
    const rolledHint = dicePetanquePlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-petanque-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DicePetanqueState = { ...fresh, phase: "done", score: -3 };
    expect(dicePetanquePlugin.hint!(done)).toBeNull();
    expect(dicePetanquePlugin.isTerminal(done)).toEqual({ score: 0 });

    const donePositive: DicePetanqueState = { ...fresh, phase: "done", score: 5 };
    expect(dicePetanquePlugin.isTerminal(donePositive)).toEqual({ score: 5 });
  });
});
