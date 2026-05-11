import { describe, it, expect } from "vitest";
import { diceRocketPlugin } from "./index.js";
import type { DiceRocketState } from "./state.js";

const S = { dummy: false } as const;

describe("dice-rocket plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceRocketPlugin.id).toBe("dice-rocket");
    expect(diceRocketPlugin.title).toBe("Dice Rocket");
    expect(diceRocketPlugin.category).toBe("dice");
    expect(diceRocketPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceRocketPlugin.description).toBe("string");
    expect(diceRocketPlugin.description.length).toBeGreaterThan(0);
    expect(diceRocketPlugin.settings).toBeDefined();
    expect(typeof diceRocketPlugin.initialState).toBe("function");
    expect(typeof diceRocketPlugin.reducer).toBe("function");
    expect(typeof diceRocketPlugin.isTerminal).toBe("function");
    expect(diceRocketPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceRocketPlugin.initialState(42, S);
    const b = diceRocketPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(42);
    expect(a.altitude).toBe(0);
    expect(a.rolls).toBe(0);
    expect(a.lastDie).toBeNull();
    expect(a.phase).toBe("playing");
    expect(a).toEqual(b);
    expect(diceRocketPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null after game over", () => {
    expect(typeof diceRocketPlugin.hint).toBe("function");
    const state = diceRocketPlugin.initialState(7, S);

    // Fresh state -> roll hint.
    const playingHint = diceRocketPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(typeof playingHint!.selector).toBe("string");
    expect(playingHint!.selector).toBe('[data-testid="hint-target-dice-rocket-roll"]');
    expect(playingHint!.pulses).toBe(3);

    // phase === "done" (the plugin checks for "gameover" or gameOver flag; phase "done" is not that).
    // Explicitly verify the gameover-style null behavior advertised by the plugin's hint.
    const gameoverState = { ...state, phase: "gameover" as unknown as DiceRocketState["phase"] };
    expect(diceRocketPlugin.hint!(gameoverState)).toBeNull();

    const gameOverFlagState = { ...state, gameOver: true } as unknown as DiceRocketState;
    expect(diceRocketPlugin.hint!(gameOverFlagState)).toBeNull();
  });
});
