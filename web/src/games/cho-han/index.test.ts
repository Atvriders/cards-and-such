import { describe, it, expect } from "vitest";
import { choHanPlugin } from "./index.js";
import type { ChoHanState } from "./state.js";

describe("cho-han plugin", () => {
  const defaultSettings = { rounds: "10" as const, betSize: "25" as const };

  it("exposes the expected plugin shape", () => {
    expect(choHanPlugin.id).toBe("cho-han");
    expect(choHanPlugin.title).toBe("Chō-han");
    expect(choHanPlugin.category).toBe("dice");
    expect(choHanPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof choHanPlugin.description).toBe("string");
    expect(choHanPlugin.description.length).toBeGreaterThan(0);
    expect(choHanPlugin.settings).toBeDefined();
    expect(typeof choHanPlugin.settings).toBe("object");
    expect(typeof choHanPlugin.initialState).toBe("function");
    expect(typeof choHanPlugin.reducer).toBe("function");
    expect(typeof choHanPlugin.isTerminal).toBe("function");
    expect(choHanPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = choHanPlugin.initialState(42, defaultSettings);
    const b = choHanPlugin.initialState(42, defaultSettings);
    expect(a).toEqual(b);
    expect(a.phase).toBe("betting");
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.bankroll).toBe(1000);
    expect(a.betSize).toBe(25);
    expect(a.currentBet).toBeNull();
    expect(a.lastRoll).toBeNull();
    expect(a.gameOver).toBe(false);
    expect(choHanPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null when the game is over", () => {
    expect(typeof choHanPlugin.hint).toBe("function");
    const state = choHanPlugin.initialState(7, defaultSettings);
    const bettingHint = choHanPlugin.hint!(state);
    expect(bettingHint).not.toBeNull();
    expect(typeof bettingHint!.selector).toBe("string");
    expect(bettingHint!.selector.length).toBeGreaterThan(0);
    expect(bettingHint!.selector).toContain("hint-target-cho-han-bet");
    if (bettingHint!.pulses !== undefined) {
      expect(typeof bettingHint!.pulses).toBe("number");
      expect(bettingHint!.pulses).toBeGreaterThan(0);
    }

    const rolled: ChoHanState = { ...state, phase: "rolled" };
    const rolledHint = choHanPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toContain("hint-target-cho-han-next");

    const finished: ChoHanState = { ...state, phase: "gameOver", gameOver: true };
    expect(choHanPlugin.hint!(finished)).toBeNull();
  });
});
