import { describe, it, expect } from "vitest";
import { diceLowRollPlugin } from "./index.js";
import type { DiceLowRollState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-low-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceLowRollPlugin.id).toBe("dice-low-roll");
    expect(diceLowRollPlugin.title).toBe("Dice Low Roll");
    expect(diceLowRollPlugin.category).toBe("dice");
    expect(diceLowRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceLowRollPlugin.description).toBe("string");
    expect(diceLowRollPlugin.description.length).toBeGreaterThan(0);
    expect(diceLowRollPlugin.settings).toBeDefined();
    expect(typeof diceLowRollPlugin.settings).toBe("object");
    expect(typeof diceLowRollPlugin.initialState).toBe("function");
    expect(typeof diceLowRollPlugin.reducer).toBe("function");
    expect(typeof diceLowRollPlugin.isTerminal).toBe("function");
    expect(diceLowRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = diceLowRollPlugin.initialState(42, S);
    const b = diceLowRollPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.coins).toBe(100);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("betting");
    expect(a.dice).toBeNull();
    expect(a.bet).toBe(0);
    expect(a.lastWin).toBeNull();
    expect(diceLowRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof diceLowRollPlugin.hint).toBe("function");
    const state = diceLowRollPlugin.initialState(5, S);

    // Fresh (betting) -> roll hint.
    const rollHint = diceLowRollPlugin.hint!(state);
    expect(rollHint).not.toBeNull();
    expect(typeof rollHint!.selector).toBe("string");
    expect(rollHint!.selector.length).toBeGreaterThan(0);
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-low-roll-roll"]');
    if (rollHint!.pulses !== undefined) {
      expect(typeof rollHint!.pulses).toBe("number");
      expect(rollHint!.pulses).toBeGreaterThan(0);
    }

    // Result phase -> next hint.
    const resultState: DiceLowRollState = { ...state, phase: "result" };
    const nextHint = diceLowRollPlugin.hint!(resultState);
    expect(nextHint).not.toBeNull();
    expect(nextHint!.selector).toBe('[data-testid="hint-target-dice-low-roll-next"]');

    // Gameover -> null.
    const overState: DiceLowRollState = { ...state, phase: "gameover" };
    expect(diceLowRollPlugin.hint!(overState)).toBeNull();
  });
});
