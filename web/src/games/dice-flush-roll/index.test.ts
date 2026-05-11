import { describe, it, expect } from "vitest";
import { diceFlushRollPlugin } from "./index.js";
import type { DiceFlushRollState } from "./state.js";

const S = { rounds: "10" } as const;

describe("dice-flush-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFlushRollPlugin.id).toBe("dice-flush-roll");
    expect(diceFlushRollPlugin.title).toBe("Dice Flush Roll");
    expect(diceFlushRollPlugin.category).toBe("dice");
    expect(diceFlushRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFlushRollPlugin.description).toBe("string");
    expect(diceFlushRollPlugin.description.length).toBeGreaterThan(0);
    expect(diceFlushRollPlugin.settings).toBeDefined();
    expect(typeof diceFlushRollPlugin.settings).toBe("object");
    expect(typeof diceFlushRollPlugin.initialState).toBe("function");
    expect(typeof diceFlushRollPlugin.reducer).toBe("function");
    expect(typeof diceFlushRollPlugin.isTerminal).toBe("function");
    expect(diceFlushRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh roll", () => {
    const a = diceFlushRollPlugin.initialState(42, S);
    const b = diceFlushRollPlugin.initialState(42, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.dice).toHaveLength(5);
    for (const d of a.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
    expect(a.kept).toEqual([false, false, false, false, false]);
    expect(a.rollsLeft).toBe(2);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.totalRounds).toBe(10);
    expect(a.phase).toBe("rolling");
    expect(diceFlushRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling and null when terminal", () => {
    expect(typeof diceFlushRollPlugin.hint).toBe("function");
    const state = diceFlushRollPlugin.initialState(7, S);

    // Fresh state: rolling with rollsLeft > 0 -> reroll hint.
    const rerollHint = diceFlushRollPlugin.hint!(state);
    expect(rerollHint).not.toBeNull();
    expect(rerollHint!.selector).toBe('[data-testid="hint-target-diceflushroll-reroll"]');
    expect(rerollHint!.pulses).toBe(3);

    // No rolls left but still rolling -> score hint.
    const noRolls: DiceFlushRollState = { ...state, rollsLeft: 0 };
    const scoreHint = diceFlushRollPlugin.hint!(noRolls);
    expect(scoreHint).not.toBeNull();
    expect(scoreHint!.selector).toBe('[data-testid="hint-target-diceflushroll-score"]');
    expect(scoreHint!.pulses).toBe(3);

    // Terminal state -> null.
    const terminal: DiceFlushRollState = { ...state, phase: "gameover" };
    expect(diceFlushRollPlugin.hint!(terminal)).toBeNull();
    expect(diceFlushRollPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });

    // Non-rolling, non-terminal phase -> hint falls through to null.
    const scored: DiceFlushRollState = { ...state, phase: "scored" };
    expect(diceFlushRollPlugin.hint!(scored)).toBeNull();
  });
});
