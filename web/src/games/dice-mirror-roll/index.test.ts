import { describe, it, expect } from "vitest";
import { diceMirrorRollPlugin } from "./index.js";
import type { DiceMirrorRollState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-mirror-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceMirrorRollPlugin.id).toBe("dice-mirror-roll");
    expect(diceMirrorRollPlugin.title).toBe("Dice Mirror Roll");
    expect(diceMirrorRollPlugin.category).toBe("dice");
    expect(diceMirrorRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceMirrorRollPlugin.description).toBe("string");
    expect(diceMirrorRollPlugin.description.length).toBeGreaterThan(0);
    expect(diceMirrorRollPlugin.settings).toBeDefined();
    expect(typeof diceMirrorRollPlugin.initialState).toBe("function");
    expect(typeof diceMirrorRollPlugin.reducer).toBe("function");
    expect(typeof diceMirrorRollPlugin.isTerminal).toBe("function");
    expect(diceMirrorRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceMirrorRollPlugin.initialState(42, S);
    const b = diceMirrorRollPlugin.initialState(42, S);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("betting");
    expect(a.score).toBe(0);
    expect(a.bet).toBeNull();
    expect(a.nextDie).toBeNull();
    expect(a.currentDie).toBeGreaterThanOrEqual(1);
    expect(a.currentDie).toBeLessThanOrEqual(6);
    expect(a.currentDie).toBe(b.currentDie);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(diceMirrorRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for betting/reveal phases and null for gameover", () => {
    expect(typeof diceMirrorRollPlugin.hint).toBe("function");
    const state = diceMirrorRollPlugin.initialState(7, S);

    // Fresh state is in "betting" phase -> roll hint.
    const bettingHint = diceMirrorRollPlugin.hint!(state);
    expect(bettingHint).not.toBeNull();
    expect(typeof bettingHint!.selector).toBe("string");
    expect(bettingHint!.selector).toBe('[data-testid="hint-target-dice-mirror-roll-roll"]');
    expect(bettingHint!.pulses).toBe(3);

    // Simulate "reveal" phase -> next hint.
    const revealState: DiceMirrorRollState = { ...state, phase: "reveal" };
    const revealHint = diceMirrorRollPlugin.hint!(revealState);
    expect(revealHint).not.toBeNull();
    expect(revealHint!.selector).toBe('[data-testid="hint-target-dice-mirror-roll-next"]');
    expect(revealHint!.pulses).toBe(3);

    // Gameover -> null.
    const gameoverState: DiceMirrorRollState = { ...state, phase: "gameover" };
    expect(diceMirrorRollPlugin.hint!(gameoverState)).toBeNull();
  });
});
