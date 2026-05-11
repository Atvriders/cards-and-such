import { describe, it, expect } from "vitest";
import { diceSkipBetPlugin } from "./index.js";
import type { DiceSkipBetState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-skip-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceSkipBetPlugin.id).toBe("dice-skip-bet");
    expect(diceSkipBetPlugin.title).toBe("Dice Skip Bet");
    expect(diceSkipBetPlugin.category).toBe("dice");
    expect(diceSkipBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceSkipBetPlugin.description).toBe("string");
    expect(diceSkipBetPlugin.description.length).toBeGreaterThan(0);
    expect(diceSkipBetPlugin.settings).toBeDefined();
    expect(typeof diceSkipBetPlugin.settings).toBe("object");
    expect(typeof diceSkipBetPlugin.initialState).toBe("function");
    expect(typeof diceSkipBetPlugin.reducer).toBe("function");
    expect(typeof diceSkipBetPlugin.isTerminal).toBe("function");
    expect(diceSkipBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceSkipBetPlugin.initialState(123, S);
    const b = diceSkipBetPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.die).toBeNull();
    expect(a.coins).toBe(100);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("betting");
    expect(diceSkipBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof diceSkipBetPlugin.hint).toBe("function");
    const state = diceSkipBetPlugin.initialState(7, S);

    // betting phase -> roll target
    const bettingHint = diceSkipBetPlugin.hint!(state);
    expect(bettingHint).not.toBeNull();
    expect(typeof bettingHint!.selector).toBe("string");
    expect(bettingHint!.selector.length).toBeGreaterThan(0);
    expect(bettingHint!.selector).toContain("dice-skip-bet-roll");
    expect(bettingHint!.pulses).toBe(3);

    // result phase -> next target
    const resultState: DiceSkipBetState = { ...state, phase: "result" };
    const resultHint = diceSkipBetPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toContain("dice-skip-bet-next");
    expect(resultHint!.pulses).toBe(3);

    // gameover phase -> null
    const gameoverState: DiceSkipBetState = { ...state, phase: "gameover" };
    expect(diceSkipBetPlugin.hint!(gameoverState)).toBeNull();
  });
});
