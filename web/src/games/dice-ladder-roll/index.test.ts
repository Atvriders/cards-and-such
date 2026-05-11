import { describe, it, expect } from "vitest";
import { diceLadderRollPlugin } from "./index.js";
import type { DiceLadderRollState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-ladder-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceLadderRollPlugin.id).toBe("dice-ladder-roll");
    expect(diceLadderRollPlugin.title).toBe("Dice Ladder Roll");
    expect(diceLadderRollPlugin.category).toBe("dice");
    expect(diceLadderRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceLadderRollPlugin.description).toBe("string");
    expect(diceLadderRollPlugin.description.length).toBeGreaterThan(0);
    expect(diceLadderRollPlugin.settings).toBeDefined();
    expect(typeof diceLadderRollPlugin.settings).toBe("object");
    expect(typeof diceLadderRollPlugin.initialState).toBe("function");
    expect(typeof diceLadderRollPlugin.reducer).toBe("function");
    expect(typeof diceLadderRollPlugin.isTerminal).toBe("function");
    expect(diceLadderRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = diceLadderRollPlugin.initialState(42, S);
    const b = diceLadderRollPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.streak).toBe(0);
    expect(a.phase).toBe("waiting");
    expect(a.maxRounds).toBe(10);
    expect(a.currentDie).toBeNull();
    expect(diceLadderRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when terminal", () => {
    expect(typeof diceLadderRollPlugin.hint).toBe("function");

    const waiting = diceLadderRollPlugin.initialState(5, S);
    const waitingHint = diceLadderRollPlugin.hint!(waiting);
    expect(waitingHint).not.toBeNull();
    expect(waitingHint!.selector).toBe('[data-testid="hint-target-dice-ladder-roll-roll"]');
    expect(waitingHint!.pulses).toBe(3);

    const resultState: DiceLadderRollState = { ...waiting, phase: "result", currentDie: 4 };
    const resultHint = diceLadderRollPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-ladder-roll-next"]');
    expect(resultHint!.pulses).toBe(3);

    const gameoverState: DiceLadderRollState = { ...waiting, phase: "gameover" };
    expect(diceLadderRollPlugin.hint!(gameoverState)).toBeNull();
    expect(diceLadderRollPlugin.isTerminal(gameoverState)).toEqual({ score: 0 });
  });
});
