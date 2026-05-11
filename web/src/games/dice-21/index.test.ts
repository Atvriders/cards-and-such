import { describe, it, expect } from "vitest";
import { dice21Plugin } from "./index.js";
import type { Dice21State } from "./state.js";

const S = { dummy: false } as never;

describe("dice-21 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dice21Plugin.id).toBe("dice-21");
    expect(dice21Plugin.title).toBe("Dice 21");
    expect(dice21Plugin.category).toBe("dice");
    expect(dice21Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dice21Plugin.description).toBe("string");
    expect(dice21Plugin.description.length).toBeGreaterThan(0);
    expect(dice21Plugin.settings).toBeDefined();
    expect(typeof dice21Plugin.settings).toBe("object");
    expect(typeof dice21Plugin.initialState).toBe("function");
    expect(typeof dice21Plugin.reducer).toBe("function");
    expect(typeof dice21Plugin.isTerminal).toBe("function");
    expect(dice21Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = dice21Plugin.initialState(42, S);
    const b = dice21Plugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.sum).toBe(0);
    expect(a.rolls).toEqual([]);
    expect(a.totalScore).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.busted).toBe(false);
    expect(dice21Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null when terminal", () => {
    expect(typeof dice21Plugin.hint).toBe("function");

    const rolling = dice21Plugin.initialState(7, S);
    const rollingHint = dice21Plugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-21-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const scored: Dice21State = { ...rolling, phase: "scored" };
    const scoredHint = dice21Plugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-21-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done: Dice21State = { ...rolling, phase: "done" };
    expect(dice21Plugin.hint!(done)).toBeNull();
    expect(dice21Plugin.isTerminal(done)).toEqual({ score: done.totalScore });
  });
});
