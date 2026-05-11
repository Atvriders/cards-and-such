import { describe, it, expect } from "vitest";
import { diceBasketballPlugin, diceBasketballSettings } from "./index.js";

const S = { periods: "2" } as const;

describe("dice-basketball plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBasketballPlugin.id).toBe("dice-basketball");
    expect(diceBasketballPlugin.title).toBe("Dice Basketball");
    expect(diceBasketballPlugin.category).toBe("dice");
    expect(diceBasketballPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBasketballPlugin.description).toBe("string");
    expect(diceBasketballPlugin.description.length).toBeGreaterThan(0);
    expect(diceBasketballPlugin.settings).toBe(diceBasketballSettings);
    expect(typeof diceBasketballPlugin.initialState).toBe("function");
    expect(typeof diceBasketballPlugin.reducer).toBe("function");
    expect(typeof diceBasketballPlugin.isTerminal).toBe("function");
    expect(diceBasketballPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = diceBasketballPlugin.initialState(42, S);
    const b = diceBasketballPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.playerScore).toBe(0);
    expect(a.aiScore).toBe(0);
    expect(a.period).toBe(1);
    expect(a.totalPeriods).toBe(2);
    expect(a.playerBall).toBe(true);
    expect(a.phase).toBe("play");
    expect(a.seed).toBe(42);
    expect(diceBasketballPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget during play and null when game is over", () => {
    expect(typeof diceBasketballPlugin.hint).toBe("function");
    const state = diceBasketballPlugin.initialState(7, S);
    const result = diceBasketballPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-dice-basketball-shoot"]');
    expect(result!.pulses).toBe(3);

    // When gameOver flag is set on state, hint should return null.
    const finished = { ...state, gameOver: true } as typeof state & { gameOver: boolean };
    expect(diceBasketballPlugin.hint!(finished)).toBeNull();

    // isTerminal returns score bucket when phase is gameOver.
    const overState = { ...state, phase: "gameOver" as const, playerScore: 10, aiScore: 5 };
    const terminal = diceBasketballPlugin.isTerminal(overState);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(1000);
  });
});
