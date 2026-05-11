import { describe, it, expect } from "vitest";
import { absurdleMiniPlugin } from "./index.js";
import type { AbsurdleMiniSettings } from "./state.js";

const S: AbsurdleMiniSettings = { rounds: "8" };

describe("absurdle-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(absurdleMiniPlugin.id).toBe("absurdle-mini");
    expect(absurdleMiniPlugin.title).toBe("Absurdle Mini");
    expect(absurdleMiniPlugin.category).toBe("board");
    expect(absurdleMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof absurdleMiniPlugin.description).toBe("string");
    expect(absurdleMiniPlugin.description.length).toBeGreaterThan(0);
    expect(absurdleMiniPlugin.settings).toBeDefined();
    expect(typeof absurdleMiniPlugin.settings).toBe("object");
    expect(typeof absurdleMiniPlugin.initialState).toBe("function");
    expect(typeof absurdleMiniPlugin.reducer).toBe("function");
    expect(typeof absurdleMiniPlugin.isTerminal).toBe("function");
    expect(absurdleMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = absurdleMiniPlugin.initialState(1234, S);
    const b = absurdleMiniPlugin.initialState(1234, S);
    expect(a.candidates).toEqual(b.candidates);
    expect(a.candidates.length).toBeGreaterThan(0);
    expect(a.guesses).toEqual([]);
    expect(a.current).toBe("");
    expect(a.status).toBe("playing");
    expect(a.maxGuesses).toBe(8);
    expect(absurdleMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the game ends", () => {
    expect(typeof absurdleMiniPlugin.hint).toBe("function");
    const state = absurdleMiniPlugin.initialState(7, S);
    const result = absurdleMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(result!.selector).toBe(".ab-board");
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.pulses).toBe(3);

    // Once the game is no longer in "playing" status, hint() must return null.
    const wonState = { ...state, status: "won" as const };
    expect(absurdleMiniPlugin.hint!(wonState)).toBeNull();
    const lostState = { ...state, status: "lost" as const };
    expect(absurdleMiniPlugin.hint!(lostState)).toBeNull();
  });
});
