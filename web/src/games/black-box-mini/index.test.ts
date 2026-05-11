import { describe, it, expect } from "vitest";
import { blackBoxMiniPlugin } from "./index.js";

const S = {} as never;

describe("black-box-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackBoxMiniPlugin.id).toBe("black-box-mini");
    expect(blackBoxMiniPlugin.title).toBe("Black Box Mini");
    expect(blackBoxMiniPlugin.category).toBe("board");
    expect(blackBoxMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackBoxMiniPlugin.description).toBe("string");
    expect(blackBoxMiniPlugin.description.length).toBeGreaterThan(0);
    expect(blackBoxMiniPlugin.settings).toBeDefined();
    expect(typeof blackBoxMiniPlugin.settings).toBe("object");
    expect(typeof blackBoxMiniPlugin.initialState).toBe("function");
    expect(typeof blackBoxMiniPlugin.reducer).toBe("function");
    expect(typeof blackBoxMiniPlugin.isTerminal).toBe("function");
    expect(blackBoxMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blackBoxMiniPlugin.initialState(42, S);
    const b = blackBoxMiniPlugin.initialState(42, S);
    expect(a.answer).toEqual(b.answer);
    expect(a.current).toEqual(b.current);
    expect(a.phase).toBe("guess");
    expect(a.guesses).toEqual([]);
    expect(blackBoxMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh guess and null when the game has ended", () => {
    expect(typeof blackBoxMiniPlugin.hint).toBe("function");
    const state = blackBoxMiniPlugin.initialState(5, S);
    const result = blackBoxMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
    expect(result!.pulses).toBe(3);

    // Once the puzzle is no longer in the guess phase, hintSelector returns null.
    const ended = { ...state, phase: "won" as const };
    expect(blackBoxMiniPlugin.hint!(ended)).toBeNull();
  });
});
