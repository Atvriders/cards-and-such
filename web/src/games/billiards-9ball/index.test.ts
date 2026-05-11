import { describe, it, expect } from "vitest";
import { billiards9BallPlugin } from "./index.js";
import type { Billiards9BallState } from "./state.js";

describe("billiards-9ball plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(billiards9BallPlugin.id).toBe("billiards-9ball");
    expect(billiards9BallPlugin.title).toBe("Billiards — 9 Ball");
    expect(billiards9BallPlugin.category).toBe("board");
    expect(billiards9BallPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof billiards9BallPlugin.description).toBe("string");
    expect(billiards9BallPlugin.description.length).toBeGreaterThan(0);
    expect(billiards9BallPlugin.settings).toBeDefined();
    expect(typeof billiards9BallPlugin.settings).toBe("object");
    expect(typeof billiards9BallPlugin.initialState).toBe("function");
    expect(typeof billiards9BallPlugin.reducer).toBe("function");
    expect(typeof billiards9BallPlugin.isTerminal).toBe("function");
    expect(billiards9BallPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const settings = { difficulty: "medium" as const };
    const a = billiards9BallPlugin.initialState(42, settings);
    const b = billiards9BallPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.phase).toBe("aim");
    expect(a.lowestBall).toBe(1);
    expect(a.pocketed).toEqual(Array(9).fill(false));
    expect(a.winner).toBe(false);
    expect(a.turns).toBe(0);
    expect(a.fouls).toBe(0);
    expect(billiards9BallPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof billiards9BallPlugin.hint).toBe("function");
    const settings = { difficulty: "medium" as const };
    const state = billiards9BallPlugin.initialState(5, settings);
    const result = billiards9BallPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal-like state to hit the early null return branch.
    const done: Billiards9BallState = { ...state, phase: "done", winner: true };
    expect(billiards9BallPlugin.hint!(done)).toBeNull();
  });
});
