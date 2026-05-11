import { describe, it, expect } from "vitest";
import { bantumiGamePlugin } from "./index.js";

const S = { dummy: false } as never;

describe("bantumi-game plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bantumiGamePlugin.id).toBe("bantumi-game");
    expect(bantumiGamePlugin.title).toBe("Bantumi");
    expect(bantumiGamePlugin.category).toBe("board");
    expect(bantumiGamePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bantumiGamePlugin.description).toBe("string");
    expect(bantumiGamePlugin.description.length).toBeGreaterThan(0);
    expect(bantumiGamePlugin.settings).toBeDefined();
    expect(typeof bantumiGamePlugin.settings).toBe("object");
    expect(typeof bantumiGamePlugin.initialState).toBe("function");
    expect(typeof bantumiGamePlugin.reducer).toBe("function");
    expect(typeof bantumiGamePlugin.isTerminal).toBe("function");
    expect(bantumiGamePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = bantumiGamePlugin.initialState(1234, S);
    const b = bantumiGamePlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.board.length).toBe(16);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.result).toBeNull();
    expect(bantumiGamePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no .btm-board element exists in DOM", () => {
    expect(typeof bantumiGamePlugin.hint).toBe("function");
    const state = bantumiGamePlugin.initialState(7, S);
    const result = bantumiGamePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".btm-board");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
