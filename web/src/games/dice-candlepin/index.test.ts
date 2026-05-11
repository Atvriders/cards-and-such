import { describe, it, expect } from "vitest";
import { diceCandlepinPlugin } from "./index.js";
import type { DiceCandlepinState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-candlepin plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceCandlepinPlugin.id).toBe("dice-candlepin");
    expect(diceCandlepinPlugin.title).toBe("Dice Candlepin Bowling");
    expect(diceCandlepinPlugin.category).toBe("dice");
    expect(diceCandlepinPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceCandlepinPlugin.description).toBe("string");
    expect(diceCandlepinPlugin.description.length).toBeGreaterThan(0);
    expect(diceCandlepinPlugin.settings).toBeDefined();
    expect(typeof diceCandlepinPlugin.settings).toBe("object");
    expect(typeof diceCandlepinPlugin.initialState).toBe("function");
    expect(typeof diceCandlepinPlugin.reducer).toBe("function");
    expect(typeof diceCandlepinPlugin.isTerminal).toBe("function");
    expect(diceCandlepinPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = diceCandlepinPlugin.initialState(123, S);
    const b = diceCandlepinPlugin.initialState(123, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.round).toBe(1);
    expect(a.phase).toBe("rolling");
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.rngSeed).toBe(123);
    expect(diceCandlepinPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceCandlepinPlugin.hint).toBe("function");
    const state = diceCandlepinPlugin.initialState(7, S);

    // Fresh state -> rolling phase -> should return the roll hint target.
    const rollingHint = diceCandlepinPlugin.hint!(state);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-candlepin-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    // Synthesise a "rolled" phase to exercise the next-hint branch.
    const rolled: DiceCandlepinState = { ...state, phase: "rolled" };
    const rolledHint = diceCandlepinPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-candlepin-next"]');
    expect(rolledHint!.pulses).toBe(3);

    // Terminal state -> hint must be null.
    const done: DiceCandlepinState = { ...state, phase: "done" };
    expect(diceCandlepinPlugin.isTerminal(done)).not.toBeNull();
    expect(diceCandlepinPlugin.hint!(done)).toBeNull();
  });
});
