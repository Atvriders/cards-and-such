import { describe, it, expect } from "vitest";
import { diceBowlPlugin } from "./index.js";
import type { DiceBowlState } from "./state.js";

const S = { dummy: false };

describe("dice-bowl plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBowlPlugin.id).toBe("dice-bowl");
    expect(diceBowlPlugin.title).toBe("Dice Bowl");
    expect(diceBowlPlugin.category).toBe("dice");
    expect(diceBowlPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBowlPlugin.description).toBe("string");
    expect(diceBowlPlugin.description.length).toBeGreaterThan(0);
    expect(diceBowlPlugin.settings).toBeDefined();
    expect(typeof diceBowlPlugin.settings).toBe("object");
    expect(typeof diceBowlPlugin.initialState).toBe("function");
    expect(typeof diceBowlPlugin.reducer).toBe("function");
    expect(typeof diceBowlPlugin.isTerminal).toBe("function");
    expect(diceBowlPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceBowlPlugin.initialState(42, S);
    const b = diceBowlPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.frame).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.dice).toEqual([]);
    expect(diceBowlPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null when terminal", () => {
    expect(typeof diceBowlPlugin.hint).toBe("function");
    const fresh = diceBowlPlugin.initialState(7, S);
    const rollingHint = diceBowlPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-bowl-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const scoredState: DiceBowlState = { ...fresh, phase: "scored" };
    const scoredHint = diceBowlPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-bowl-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: DiceBowlState = { ...fresh, phase: "done" };
    expect(diceBowlPlugin.hint!(doneState)).toBeNull();
    expect(diceBowlPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
