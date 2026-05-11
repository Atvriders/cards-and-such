import { describe, it, expect } from "vitest";
import { abalonePlugin } from "./index.js";
import type { AbaloneState } from "./state.js";

describe("abalone plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(abalonePlugin.id).toBe("abalone");
    expect(abalonePlugin.title).toBe("Abalone");
    expect(abalonePlugin.category).toBe("board");
    expect(abalonePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof abalonePlugin.description).toBe("string");
    expect(abalonePlugin.description.length).toBeGreaterThan(0);
    expect(typeof abalonePlugin.howToPlay).toBe("string");
    expect(abalonePlugin.settings).toBeDefined();
    expect(abalonePlugin.settings.startPosition.kind).toBe("enum");
    expect(abalonePlugin.settings.startPosition.default).toBe("standard");
    expect(abalonePlugin.settings.startPosition.options).toContain("standard");
    expect(abalonePlugin.settings.startPosition.options).toContain("belgian_daisy");
    expect(typeof abalonePlugin.initialState).toBe("function");
    expect(typeof abalonePlugin.reducer).toBe("function");
    expect(typeof abalonePlugin.isTerminal).toBe("function");
    expect(typeof abalonePlugin.hint).toBe("function");
    expect(abalonePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = abalonePlugin.initialState(123, { startPosition: "standard" });
    const b = abalonePlugin.initialState(123, { startPosition: "standard" });

    expect(a.turn).toBe(0);
    expect(a.winner).toBeNull();
    expect(a.pushed).toEqual([0, 0]);
    expect(a.selected).toEqual([]);
    expect(a.movesMade).toBe(0);
    expect(a.rngSeed).toBe(123);

    // Compare boards by sorted serialized entries (Maps preserve insertion order
    // here but we compare values explicitly to be robust).
    const aEntries = [...a.board.entries()].sort(([k1], [k2]) => k1.localeCompare(k2));
    const bEntries = [...b.board.entries()].sort(([k1], [k2]) => k1.localeCompare(k2));
    expect(aEntries).toEqual(bEntries);
    expect(a.board.size).toBe(61);

    expect(abalonePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for a fresh state and null when it should not fire", () => {
    const state = abalonePlugin.initialState(7, { startPosition: "standard" });
    const result = abalonePlugin.hint!(state);
    // There are always empty cells on a fresh standard board, so we expect a target.
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toMatch(/^\[data-testid="abal-/);
      expect(result.pulses).toBe(3);
    }

    // hint returns null when the game has a winner.
    const won: AbaloneState = { ...state, winner: 0 };
    expect(abalonePlugin.hint!(won)).toBeNull();

    // hint returns null when it is not the human's turn.
    const botTurn: AbaloneState = { ...state, turn: 1 };
    expect(abalonePlugin.hint!(botTurn)).toBeNull();
  });
});
