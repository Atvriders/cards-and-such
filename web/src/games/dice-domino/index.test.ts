import { describe, it, expect } from "vitest";
import { diceDominoPlugin } from "./index.js";
import type { DiceDominoState } from "./state.js";

const S = { dummy: false } as never;

describe("dice-domino plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceDominoPlugin.id).toBe("dice-domino");
    expect(diceDominoPlugin.title).toBe("Dice Domino");
    expect(diceDominoPlugin.category).toBe("dice");
    expect(diceDominoPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceDominoPlugin.description).toBe("string");
    expect(diceDominoPlugin.description.length).toBeGreaterThan(0);
    expect(diceDominoPlugin.settings).toBeDefined();
    expect(typeof diceDominoPlugin.settings).toBe("object");
    expect(typeof diceDominoPlugin.initialState).toBe("function");
    expect(typeof diceDominoPlugin.reducer).toBe("function");
    expect(typeof diceDominoPlugin.isTerminal).toBe("function");
    expect(diceDominoPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceDominoPlugin.initialState(42, S);
    const b = diceDominoPlugin.initialState(42, S);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("ready");
    expect(a.rolled).toBeNull();
    expect(a.lastBonus).toBe(0);
    expect(a.target).toEqual(b.target);
    expect(a.rngSeed).toBe(b.rngSeed);
    // Target values must be valid dice faces.
    expect(a.target[0]).toBeGreaterThanOrEqual(1);
    expect(a.target[0]).toBeLessThanOrEqual(6);
    expect(a.target[1]).toBeGreaterThanOrEqual(1);
    expect(a.target[1]).toBeLessThanOrEqual(6);
    expect(diceDominoPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal/unknown", () => {
    expect(typeof diceDominoPlugin.hint).toBe("function");
    const ready = diceDominoPlugin.initialState(7, S);
    const readyHint = diceDominoPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-dice-domino-roll"]');
    expect(readyHint!.pulses).toBe(3);

    const rolled: DiceDominoState = { ...ready, phase: "rolled", rolled: [1, 2] };
    const rolledHint = diceDominoPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-domino-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceDominoState = { ...ready, phase: "done", score: 100 };
    expect(diceDominoPlugin.hint!(done)).toBeNull();
    expect(diceDominoPlugin.isTerminal(done)).toEqual({ score: 100 });
  });
});
