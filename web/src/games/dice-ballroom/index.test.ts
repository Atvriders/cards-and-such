import { describe, it, expect } from "vitest";
import { diceBallroomPlugin } from "./index.js";

const S = {} as never;

describe("dice-ballroom plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBallroomPlugin.id).toBe("dice-ballroom");
    expect(diceBallroomPlugin.title).toBe("Dice Ballroom");
    expect(diceBallroomPlugin.category).toBe("dice");
    expect(diceBallroomPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBallroomPlugin.description).toBe("string");
    expect(diceBallroomPlugin.description.length).toBeGreaterThan(0);
    expect(diceBallroomPlugin.settings).toBeDefined();
    expect(typeof diceBallroomPlugin.settings).toBe("object");
    expect(typeof diceBallroomPlugin.initialState).toBe("function");
    expect(typeof diceBallroomPlugin.reducer).toBe("function");
    expect(typeof diceBallroomPlugin.isTerminal).toBe("function");
    expect(diceBallroomPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = diceBallroomPlugin.initialState(42, S);
    const b = diceBallroomPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.choice).toBeNull();
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("predict");
    expect(diceBallroomPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when phase is done", () => {
    expect(typeof diceBallroomPlugin.hint).toBe("function");
    const state = diceBallroomPlugin.initialState(7, S);
    const result = diceBallroomPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-dice-ballroom-roll"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the final null branch via the `phase === "gameover"` check.
    const gameover = { ...state, phase: "gameover" as unknown as typeof state.phase };
    expect(diceBallroomPlugin.hint!(gameover)).toBeNull();

    // Also exercise the `gameOver` fallback condition.
    const gameOverFlag = { ...state, gameOver: true } as unknown as typeof state;
    expect(diceBallroomPlugin.hint!(gameOverFlag)).toBeNull();
  });
});
