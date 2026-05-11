import { describe, it, expect } from "vitest";
import { diceCricketDartsPlugin } from "./index.js";
import type { DiceCricketDartsState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-cricket-darts plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceCricketDartsPlugin.id).toBe("dice-cricket-darts");
    expect(diceCricketDartsPlugin.title).toBe("Dice Cricket Darts");
    expect(diceCricketDartsPlugin.category).toBe("dice");
    expect(diceCricketDartsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceCricketDartsPlugin.description).toBe("string");
    expect(diceCricketDartsPlugin.description.length).toBeGreaterThan(0);
    expect(diceCricketDartsPlugin.settings).toBeDefined();
    expect(typeof diceCricketDartsPlugin.initialState).toBe("function");
    expect(typeof diceCricketDartsPlugin.reducer).toBe("function");
    expect(typeof diceCricketDartsPlugin.isTerminal).toBe("function");
    expect(diceCricketDartsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null at start", () => {
    const a = diceCricketDartsPlugin.initialState(42, S);
    const b = diceCricketDartsPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.dice).toBeNull();
    expect(diceCricketDartsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/rolled phases and null when terminal", () => {
    expect(typeof diceCricketDartsPlugin.hint).toBe("function");
    const fresh = diceCricketDartsPlugin.initialState(7, S);
    const rollingHint = diceCricketDartsPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-cricket-darts-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolledState: DiceCricketDartsState = { ...fresh, phase: "rolled" };
    const rolledHint = diceCricketDartsPlugin.hint!(rolledState);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-cricket-darts-next"]');

    const doneState: DiceCricketDartsState = { ...fresh, phase: "done" };
    expect(diceCricketDartsPlugin.hint!(doneState)).toBeNull();
    expect(diceCricketDartsPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
