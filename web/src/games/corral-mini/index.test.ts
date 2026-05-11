import { describe, it, expect } from "vitest";
import { corralMiniPlugin } from "./index.js";
import type { CorralMiniState } from "./state.js";

const S = {} as never;

describe("corral-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(corralMiniPlugin.id).toBe("corral-mini");
    expect(corralMiniPlugin.title).toBe("Corral Mini");
    expect(corralMiniPlugin.category).toBe("board");
    expect(corralMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof corralMiniPlugin.description).toBe("string");
    expect(corralMiniPlugin.description.length).toBeGreaterThan(0);
    expect(corralMiniPlugin.settings).toBeDefined();
    expect(typeof corralMiniPlugin.settings).toBe("object");
    expect(typeof corralMiniPlugin.initialState).toBe("function");
    expect(typeof corralMiniPlugin.reducer).toBe("function");
    expect(typeof corralMiniPlugin.isTerminal).toBe("function");
    expect(corralMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = corralMiniPlugin.initialState(42, S);
    const b = corralMiniPlugin.initialState(42, S);
    const aIds = a.puzzles.map((p) => p.prompt).join("|");
    const bIds = b.puzzles.map((p) => p.prompt).join("|");
    expect(aIds).toBe(bIds);
    expect(a.idx).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correct).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.phase).toBe("playing");
    expect(a.puzzles.length).toBeGreaterThan(0);
    expect(corralMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the phase changes", () => {
    expect(typeof corralMiniPlugin.hint).toBe("function");
    const state = corralMiniPlugin.initialState(5, S);
    const result = corralMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-corral-mini-answer-0"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const doneState: CorralMiniState = { ...state, phase: "done" };
    expect(corralMiniPlugin.hint!(doneState)).toBeNull();

    const resultState: CorralMiniState = { ...state, phase: "result" };
    expect(corralMiniPlugin.hint!(resultState)).toBeNull();
  });
});
