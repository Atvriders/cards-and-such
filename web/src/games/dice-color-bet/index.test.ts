import { describe, it, expect } from "vitest";
import { diceColorBetPlugin } from "./index.js";
import type { DiceColorBetState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-color-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceColorBetPlugin.id).toBe("dice-color-bet");
    expect(diceColorBetPlugin.title).toBe("Dice Color Bet");
    expect(diceColorBetPlugin.category).toBe("dice");
    expect(diceColorBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceColorBetPlugin.description).toBe("string");
    expect(diceColorBetPlugin.description.length).toBeGreaterThan(0);
    expect(diceColorBetPlugin.settings).toBeDefined();
    expect(typeof diceColorBetPlugin.settings).toBe("object");
    expect(typeof diceColorBetPlugin.initialState).toBe("function");
    expect(typeof diceColorBetPlugin.reducer).toBe("function");
    expect(typeof diceColorBetPlugin.isTerminal).toBe("function");
    expect(diceColorBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = diceColorBetPlugin.initialState(123, S);
    const b = diceColorBetPlugin.initialState(123, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("betting");
    expect(a.coins).toBe(100);
    expect(a.bet).toBe(0);
    expect(a.choice).toBeNull();
    expect(a.dice).toBeNull();
    expect(a.lastWin).toBeNull();
    expect(diceColorBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for betting/result phases and null when terminal", () => {
    expect(typeof diceColorBetPlugin.hint).toBe("function");
    const state = diceColorBetPlugin.initialState(7, S);

    // Fresh state -> betting phase -> should return the roll hint target.
    const bettingHint = diceColorBetPlugin.hint!(state);
    expect(bettingHint).not.toBeNull();
    expect(bettingHint!.selector).toBe('[data-testid="hint-target-dice-color-bet-roll"]');
    expect(bettingHint!.pulses).toBe(3);

    // Synthesise a "result" phase to exercise the next-hint branch.
    const result: DiceColorBetState = { ...state, phase: "result" };
    const resultHint = diceColorBetPlugin.hint!(result);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-color-bet-next"]');
    expect(resultHint!.pulses).toBe(3);

    // Terminal state -> hint must be null.
    const done: DiceColorBetState = { ...state, phase: "gameover" };
    expect(diceColorBetPlugin.isTerminal(done)).not.toBeNull();
    expect(diceColorBetPlugin.hint!(done)).toBeNull();
  });
});
