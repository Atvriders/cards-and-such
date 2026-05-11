import { describe, it, expect } from "vitest";
import { diceSpikeballPlugin } from "./index.js";
import type { DiceSpikeballState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-spikeball plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSpikeballPlugin.id).toBe("dice-spikeball");
    expect(diceSpikeballPlugin.title).toBe("Dice Spikeball");
    expect(diceSpikeballPlugin.category).toBe("dice");
    expect(diceSpikeballPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSpikeballPlugin.description).toBe("string");
    expect(diceSpikeballPlugin.description.length).toBeGreaterThan(0);
    expect(diceSpikeballPlugin.settings).toBeDefined();
    expect(typeof diceSpikeballPlugin.settings).toBe("object");
    expect(typeof diceSpikeballPlugin.initialState).toBe("function");
    expect(typeof diceSpikeballPlugin.reducer).toBe("function");
    expect(typeof diceSpikeballPlugin.isTerminal).toBe("function");
    expect(diceSpikeballPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = diceSpikeballPlugin.initialState(42, S);
    const b = diceSpikeballPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.cpuScore).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(diceSpikeballPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof diceSpikeballPlugin.hint).toBe("function");

    const rolling = diceSpikeballPlugin.initialState(7, S);
    const rollingHint = diceSpikeballPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-spikeball-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DiceSpikeballState = { ...rolling, phase: "rolled" };
    const rolledHint = diceSpikeballPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-spikeball-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceSpikeballState = { ...rolling, phase: "done" };
    expect(diceSpikeballPlugin.hint!(done)).toBeNull();
    expect(diceSpikeballPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
