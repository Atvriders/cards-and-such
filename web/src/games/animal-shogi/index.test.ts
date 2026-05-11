import { describe, it, expect } from "vitest";
import { animalShogiPlugin } from "./index.js";

const S = { dummy: false };

describe("animal-shogi plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(animalShogiPlugin.id).toBe("animal-shogi");
    expect(animalShogiPlugin.title).toBe("Animal Shogi (Dobutsu)");
    expect(animalShogiPlugin.category).toBe("board");
    expect(animalShogiPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof animalShogiPlugin.description).toBe("string");
    expect(animalShogiPlugin.description.length).toBeGreaterThan(0);
    expect(typeof animalShogiPlugin.howToPlay).toBe("string");
    expect(animalShogiPlugin.settings).toBeDefined();
    expect(typeof animalShogiPlugin.initialState).toBe("function");
    expect(typeof animalShogiPlugin.reducer).toBe("function");
    expect(typeof animalShogiPlugin.isTerminal).toBe("function");
    expect(typeof animalShogiPlugin.hint).toBe("function");
    expect(animalShogiPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = animalShogiPlugin.initialState(123, S);
    const b = animalShogiPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(123);
    expect(a.board.length).toBe(9);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(a.score).toBe(0);
    expect(a.captures).toBe(0);
    expect(a.phase).toBe("playing");
    expect(animalShogiPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when the board is mounted and null otherwise; isTerminal returns score when done", () => {
    const state = animalShogiPlugin.initialState(7, S);

    // No DOM element present — hint should be null.
    const noEl = animalShogiPlugin.hint!(state);
    expect(noEl).toBeNull();

    // Mount a fake element with the expected selector — hint should return a target.
    const el = document.createElement("div");
    el.className = "ash-board";
    document.body.appendChild(el);
    try {
      const playingHint = animalShogiPlugin.hint!(state);
      expect(playingHint).not.toBeNull();
      expect(playingHint!.selector).toBe(".ash-board");
      expect(playingHint!.pulses).toBe(3);
    } finally {
      document.body.removeChild(el);
    }

    const doneState = { ...state, phase: "done" as const, score: 42 };
    expect(animalShogiPlugin.isTerminal(doneState)).toEqual({ score: 42 });
  });
});
