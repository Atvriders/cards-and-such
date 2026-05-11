import { describe, it, expect } from "vitest";
import { diceHockeyPlugin } from "./index.js";

describe("dice-hockey plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceHockeyPlugin.id).toBe("dice-hockey");
    expect(diceHockeyPlugin.title).toBe("Dice Hockey");
    expect(diceHockeyPlugin.category).toBe("dice");
    expect(diceHockeyPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceHockeyPlugin.description).toBe("string");
    expect(diceHockeyPlugin.description.length).toBeGreaterThan(0);
    expect(diceHockeyPlugin.settings).toBeDefined();
    expect(typeof diceHockeyPlugin.settings).toBe("object");
    expect(typeof diceHockeyPlugin.initialState).toBe("function");
    expect(typeof diceHockeyPlugin.reducer).toBe("function");
    expect(typeof diceHockeyPlugin.isTerminal).toBe("function");
    expect(diceHockeyPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const settings = { periods: "2" as const };
    const a = diceHockeyPlugin.initialState(42, settings);
    const b = diceHockeyPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.playerScore).toBe(0);
    expect(a.aiScore).toBe(0);
    expect(a.period).toBe(1);
    expect(a.totalPeriods).toBe(2);
    expect(a.possession).toBe("player");
    expect(a.puckPosition).toBe(5);
    expect(a.phase).toBe("play");
    expect(diceHockeyPlugin.isTerminal(a)).toBeNull();

    // Three-period setting flows through.
    const c = diceHockeyPlugin.initialState(42, { periods: "3" as const });
    expect(c.totalPeriods).toBe(3);

    // gameOver phase yields a finite terminal score.
    const terminal = diceHockeyPlugin.isTerminal({ ...a, phase: "gameOver", playerScore: 2, aiScore: 1 });
    expect(terminal).not.toBeNull();
    expect(typeof terminal!.score).toBe("number");
  });

  it("hint returns a HintTarget during play and null when the game is over", () => {
    expect(typeof diceHockeyPlugin.hint).toBe("function");
    const state = diceHockeyPlugin.initialState(7, { periods: "2" as const });
    const result = diceHockeyPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/dice-hockey/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // The hint() implementation checks a `gameOver` flag and returns null if set.
    const over = { ...state, gameOver: true } as unknown as typeof state;
    expect(diceHockeyPlugin.hint!(over)).toBeNull();
  });
});
