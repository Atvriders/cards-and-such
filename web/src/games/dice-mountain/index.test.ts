import { describe, it, expect } from "vitest";
import { diceMountainPlugin } from "./index.js";
import type { DiceMountainState } from "./state.js";

const S = { dummy: false };

describe("dice-mountain plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceMountainPlugin.id).toBe("dice-mountain");
    expect(diceMountainPlugin.title).toBe("Dice Mountain");
    expect(diceMountainPlugin.category).toBe("dice");
    expect(diceMountainPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceMountainPlugin.description).toBe("string");
    expect(diceMountainPlugin.description.length).toBeGreaterThan(0);
    expect(diceMountainPlugin.settings).toBeDefined();
    expect(typeof diceMountainPlugin.settings).toBe("object");
    expect(typeof diceMountainPlugin.initialState).toBe("function");
    expect(typeof diceMountainPlugin.reducer).toBe("function");
    expect(typeof diceMountainPlugin.isTerminal).toBe("function");
    expect(diceMountainPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceMountainPlugin.initialState(123, S);
    const b = diceMountainPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.altitude).toBe(0);
    expect(a.rolls).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.lastDelta).toBe(0);
    expect(diceMountainPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for roll/scored phases and null when done", () => {
    expect(typeof diceMountainPlugin.hint).toBe("function");

    const fresh = diceMountainPlugin.initialState(7, S);
    const rollHint = diceMountainPlugin.hint!(fresh);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-mountain-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const scored: DiceMountainState = { ...fresh, phase: "scored", dice: [3, 4], altitude: 7, rolls: 1, lastDelta: 7 };
    const scoredHint = diceMountainPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-mountain-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done: DiceMountainState = { ...fresh, phase: "done", altitude: 100, rolls: 14, score: 130 };
    expect(diceMountainPlugin.hint!(done)).toBeNull();
    expect(diceMountainPlugin.isTerminal(done)).toEqual({ score: 130 });
  });
});
