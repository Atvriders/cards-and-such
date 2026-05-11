import { describe, it, expect } from "vitest";
import { candyFriendsMiniPlugin } from "./index.js";
import type { CandyFriendsMiniState } from "./state.js";

const S = { dummy: false } as const;

describe("candy-friends-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(candyFriendsMiniPlugin.id).toBe("candy-friends-mini");
    expect(candyFriendsMiniPlugin.title).toBe("Candy Friends Mini");
    expect(candyFriendsMiniPlugin.category).toBe("arcade");
    expect(candyFriendsMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof candyFriendsMiniPlugin.description).toBe("string");
    expect(candyFriendsMiniPlugin.description.length).toBeGreaterThan(0);
    expect(candyFriendsMiniPlugin.settings).toBeDefined();
    expect(typeof candyFriendsMiniPlugin.settings).toBe("object");
    expect(typeof candyFriendsMiniPlugin.initialState).toBe("function");
    expect(typeof candyFriendsMiniPlugin.reducer).toBe("function");
    expect(typeof candyFriendsMiniPlugin.isTerminal).toBe("function");
    expect(candyFriendsMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = candyFriendsMiniPlugin.initialState(42, S);
    const b = candyFriendsMiniPlugin.initialState(42, S);
    const aGrid = a.grid.map((row) => row.join(",")).join(";");
    const bGrid = b.grid.map((row) => row.join(",")).join(";");
    expect(aGrid).toBe(bGrid);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.score).toBe(0);
    expect(a.matches).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.phase).toBe("playing");
    expect(candyFriendsMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof candyFriendsMiniPlugin.hint).toBe("function");
    const state = candyFriendsMiniPlugin.initialState(5, S);
    const result = candyFriendsMiniPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-candy-friends-mini-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal-phase branch where hint returns null.
    const finished: CandyFriendsMiniState = { ...state, phase: "done" };
    expect(candyFriendsMiniPlugin.hint!(finished)).toBeNull();
    expect(candyFriendsMiniPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
