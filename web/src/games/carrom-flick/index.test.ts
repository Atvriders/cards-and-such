import { describe, it, expect } from "vitest";
import { carromFlickPlugin } from "./index.js";
import type { AbsState } from "./state.js";

const S = { dummy: false };

describe("carrom-flick plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carromFlickPlugin.id).toBe("carrom-flick");
    expect(carromFlickPlugin.title).toBe("Carrom (Flick)");
    expect(carromFlickPlugin.category).toBe("board");
    expect(carromFlickPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carromFlickPlugin.description).toBe("string");
    expect(carromFlickPlugin.description.length).toBeGreaterThan(0);
    expect(carromFlickPlugin.settings).toBeDefined();
    expect(typeof carromFlickPlugin.settings).toBe("object");
    expect(typeof carromFlickPlugin.initialState).toBe("function");
    expect(typeof carromFlickPlugin.reducer).toBe("function");
    expect(typeof carromFlickPlugin.isTerminal).toBe("function");
    expect(carromFlickPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = carromFlickPlugin.initialState(42, S);
    const b = carromFlickPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.board.length).toBe(25);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(carromFlickPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing on P's turn and null otherwise", () => {
    expect(typeof carromFlickPlugin.hint).toBe("function");
    const state = carromFlickPlugin.initialState(7, S);
    const playing = carromFlickPlugin.hint!(state);
    expect(playing).not.toBeNull();
    expect(playing!.selector).toBe(".ab-cell:not(.p):not(.c)");
    expect(playing!.pulses).toBe(3);

    const doneState: AbsState = { ...state, phase: "done", result: "draw" };
    expect(carromFlickPlugin.hint!(doneState)).toBeNull();
    expect(carromFlickPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });

    const cTurn: AbsState = { ...state, turn: "C" };
    expect(carromFlickPlugin.hint!(cTurn)).toBeNull();
  });
});
