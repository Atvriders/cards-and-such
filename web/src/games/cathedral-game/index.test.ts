import { describe, it, expect } from "vitest";
import { cathedralGamePlugin } from "./index.js";
import type { CathedralState } from "./state.js";

const S = {} as never;

describe("cathedral-game plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cathedralGamePlugin.id).toBe("cathedral-game");
    expect(cathedralGamePlugin.title).toBe("Cathedral");
    expect(cathedralGamePlugin.category).toBe("board");
    expect(cathedralGamePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cathedralGamePlugin.description).toBe("string");
    expect(cathedralGamePlugin.description.length).toBeGreaterThan(0);
    expect(cathedralGamePlugin.settings).toBeDefined();
    expect(typeof cathedralGamePlugin.settings).toBe("object");
    expect(typeof cathedralGamePlugin.initialState).toBe("function");
    expect(typeof cathedralGamePlugin.reducer).toBe("function");
    expect(typeof cathedralGamePlugin.isTerminal).toBe("function");
    expect(cathedralGamePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cathedralGamePlugin.initialState(42, S);
    const b = cathedralGamePlugin.initialState(42, S);
    const aBoard = a.board.map((c) => c ?? ".").join("");
    const bBoard = b.board.map((c) => c ?? ".").join("");
    expect(aBoard).toBe(bBoard);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.winner).toBe(b.winner);
    expect(a.p0Pieces.length).toBe(b.p0Pieces.length);
    expect(a.p1Pieces.length).toBe(b.p1Pieces.length);
    expect(cathedralGamePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cathedralGamePlugin.hint).toBe("function");
    const state = cathedralGamePlugin.initialState(7, S);
    const result = cathedralGamePlugin.hint!(state);
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

    // Force the terminal branch: hint() returns null when phase is "done".
    const finished: CathedralState = { ...state, phase: "done", winner: "draw" };
    expect(cathedralGamePlugin.hint!(finished)).toBeNull();
  });
});
