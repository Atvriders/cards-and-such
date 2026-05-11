import { describe, it, expect } from "vitest";
import { diceBingoMiniPlugin } from "./index.js";

const S = { rolls: "15" } as const;

describe("dice-bingo-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBingoMiniPlugin.id).toBe("dice-bingo-mini");
    expect(diceBingoMiniPlugin.title).toBe("Dice Bingo Mini");
    expect(diceBingoMiniPlugin.category).toBe("dice");
    expect(diceBingoMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBingoMiniPlugin.description).toBe("string");
    expect(diceBingoMiniPlugin.description.length).toBeGreaterThan(0);
    expect(diceBingoMiniPlugin.settings).toBeDefined();
    expect(typeof diceBingoMiniPlugin.settings).toBe("object");
    expect(typeof diceBingoMiniPlugin.initialState).toBe("function");
    expect(typeof diceBingoMiniPlugin.reducer).toBe("function");
    expect(typeof diceBingoMiniPlugin.isTerminal).toBe("function");
    expect(diceBingoMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh card", () => {
    const a = diceBingoMiniPlugin.initialState(42, S);
    const b = diceBingoMiniPlugin.initialState(42, S);
    const aIds = a.card.map((row) => row.join(",")).join(";");
    const bIds = b.card.map((row) => row.join(",")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.rollCount).toBe(0);
    expect(a.score).toBe(0);
    expect(a.bingos).toBe(0);
    expect(a.maxRolls).toBe(15);
    expect(a.phase).toBe("rolling");
    expect(diceBingoMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for any phase", () => {
    expect(typeof diceBingoMiniPlugin.hint).toBe("function");
    const state = diceBingoMiniPlugin.initialState(5, S);
    const result = diceBingoMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/dice-bingo-mini/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Try an unknown phase to hit fallback branch
    const fallback = diceBingoMiniPlugin.hint!({ ...state, phase: "won" } as typeof state);
    expect(fallback).not.toBeNull();
    if (fallback !== null) {
      expect(fallback.selector).toMatch(/dice-bingo-mini/);
    }
  });
});
