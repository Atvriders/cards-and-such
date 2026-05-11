import { describe, it, expect } from "vitest";
import { diceBicycleVelodromePlugin } from "./index.js";
import type { DiceBicycleVelodromeState } from "./state.js";

const S = { dummy: true } as const;

describe("dice-bicycle-velodrome plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBicycleVelodromePlugin.id).toBe("dice-bicycle-velodrome");
    expect(diceBicycleVelodromePlugin.title).toBe("Dice Velodrome");
    expect(diceBicycleVelodromePlugin.category).toBe("dice");
    expect(diceBicycleVelodromePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBicycleVelodromePlugin.description).toBe("string");
    expect(diceBicycleVelodromePlugin.description.length).toBeGreaterThan(0);
    expect(diceBicycleVelodromePlugin.settings).toBeDefined();
    expect(typeof diceBicycleVelodromePlugin.settings).toBe("object");
    expect(typeof diceBicycleVelodromePlugin.initialState).toBe("function");
    expect(typeof diceBicycleVelodromePlugin.reducer).toBe("function");
    expect(typeof diceBicycleVelodromePlugin.isTerminal).toBe("function");
    expect(diceBicycleVelodromePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceBicycleVelodromePlugin.initialState(42, S);
    const b = diceBicycleVelodromePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("rolling");
    expect(a.myPos).toBe(0);
    expect(a.cpuPos).toEqual([0, 0, 0]);
    expect(diceBicycleVelodromePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active phases and null when terminal", () => {
    expect(typeof diceBicycleVelodromePlugin.hint).toBe("function");

    const rolling = diceBicycleVelodromePlugin.initialState(7, S);
    const rollingHint = diceBicycleVelodromePlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-bicycle-velodrome-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolledState: DiceBicycleVelodromeState = { ...rolling, phase: "rolled" };
    const rolledHint = diceBicycleVelodromePlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-bicycle-velodrome-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const doneState: DiceBicycleVelodromeState = { ...rolling, phase: "done", score: 42 };
    expect(diceBicycleVelodromePlugin.hint!(doneState)).toBeNull();
    expect(diceBicycleVelodromePlugin.isTerminal(doneState)).toEqual({ score: 42 });
  });
});
