import { describe, it, expect } from "vitest";
import { chess960Plugin } from "./index.js";
import type { Chess960State } from "./state.js";

describe("chess960 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chess960Plugin.id).toBe("chess960");
    expect(chess960Plugin.title).toBe("Chess960");
    expect(chess960Plugin.category).toBe("board");
    expect(chess960Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chess960Plugin.description).toBe("string");
    expect(chess960Plugin.description.length).toBeGreaterThan(0);
    expect(chess960Plugin.settings).toBeDefined();
    expect(typeof chess960Plugin.settings).toBe("object");
    expect(typeof chess960Plugin.initialState).toBe("function");
    expect(typeof chess960Plugin.reducer).toBe("function");
    expect(typeof chess960Plugin.isTerminal).toBe("function");
    expect(chess960Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh setup", () => {
    const settings = { opponent: "medium" as const };
    const a = chess960Plugin.initialState(42, settings);
    const b = chess960Plugin.initialState(42, settings);
    const aBoard = a.board.map((p) => (p ? `${p.color[0]}${p.type[0]}` : "--")).join(",");
    const bBoard = b.board.map((p) => (p ? `${p.color[0]}${p.type[0]}` : "--")).join(",");
    expect(aBoard).toBe(bBoard);
    expect(a.turn).toBe("white");
    expect(a.result).toBeNull();
    expect(a.rngSeed).toBe(42);
    expect(chess960Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof chess960Plugin.hint).toBe("function");
    const settings = { opponent: "medium" as const };
    const state = chess960Plugin.initialState(5, settings);
    const result = chess960Plugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Mark the game as finished to force hint() to fall through to the `return null` branch.
    const finished: Chess960State = { ...state, result: "draw" };
    // The hint guard checks `phase === "done"` and similar flags; mutate state to ensure null.
    const finishedWithFlag = { ...finished, gameOver: true } as unknown as Chess960State;
    expect(chess960Plugin.hint!(finishedWithFlag)).toBeNull();
  });
});
