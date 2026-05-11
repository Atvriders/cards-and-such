import { describe, it, expect } from "vitest";
import { checkersPlugin } from "./index.js";
import type { CheckersState, CheckersSettings } from "./state.js";

const settings: CheckersSettings = {
  mandatoryCapture: true,
  opponent: "bot",
  botDepth: "2",
};

describe("checkers plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(checkersPlugin.id).toBe("checkers");
    expect(checkersPlugin.title).toBe("Checkers");
    expect(checkersPlugin.category).toBe("board");
    expect(checkersPlugin.players).toEqual({ min: 1, max: 2, multiplayer: false });
    expect(typeof checkersPlugin.description).toBe("string");
    expect(checkersPlugin.description.length).toBeGreaterThan(0);
    expect(checkersPlugin.settings).toBeDefined();
    expect(typeof checkersPlugin.settings).toBe("object");
    expect(typeof checkersPlugin.initialState).toBe("function");
    expect(typeof checkersPlugin.reducer).toBe("function");
    expect(typeof checkersPlugin.isTerminal).toBe("function");
    expect(checkersPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = checkersPlugin.initialState(42, settings);
    const b = checkersPlugin.initialState(42, settings);

    const serialize = (s: CheckersState): string =>
      [...s.grid.coords()]
        .map((c) => {
          const p = s.grid.get(c);
          if (p === null) return `${c.row},${c.col}:.`;
          return `${c.row},${c.col}:${p.color[0]}${p.king ? "K" : ""}`;
        })
        .join("|");

    expect(serialize(a)).toBe(serialize(b));
    expect(a.turn).toBe("red");
    expect(a.winner).toBeNull();
    expect(a.selected).toBeNull();
    expect(a.mustContinueFrom).toBeNull();
    expect(a.movesWithoutCapture).toBe(0);
    expect(checkersPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on red's turn and null when no hint applies", () => {
    expect(typeof checkersPlugin.hint).toBe("function");

    // Fresh board, red's turn -> should return a valid HintTarget.
    const fresh = checkersPlugin.initialState(7, settings);
    const target = checkersPlugin.hint!(fresh);
    expect(target).not.toBeNull();
    if (target !== null) {
      expect(typeof target.selector).toBe("string");
      expect(target.selector).toMatch(/^\[data-testid="cell-\d+-\d+"\]$/);
      if (target.pulses !== undefined) {
        expect(typeof target.pulses).toBe("number");
        expect(target.pulses).toBeGreaterThan(0);
      }
    }

    // Winner set -> hint returns null.
    const won: CheckersState = { ...fresh, winner: "red" };
    expect(checkersPlugin.hint!(won)).toBeNull();

    // Bot's turn -> hint returns null in bot mode.
    const botsTurn: CheckersState = { ...fresh, turn: "black" };
    expect(checkersPlugin.hint!(botsTurn)).toBeNull();
  });
});
