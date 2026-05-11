import { describe, it, expect } from "vitest";
import { boggle4x4Plugin } from "./index.js";
import type { GameState } from "./state.js";

const S = { rounds: "8" } as const;

describe("boggle-4x4 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(boggle4x4Plugin.id).toBe("boggle-4x4");
    expect(boggle4x4Plugin.title).toBe("Boggle 4x4");
    expect(boggle4x4Plugin.category).toBe("board");
    expect(boggle4x4Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof boggle4x4Plugin.description).toBe("string");
    expect(boggle4x4Plugin.description.length).toBeGreaterThan(0);
    expect(boggle4x4Plugin.settings).toBeDefined();
    expect(typeof boggle4x4Plugin.settings).toBe("object");
    expect(typeof boggle4x4Plugin.initialState).toBe("function");
    expect(typeof boggle4x4Plugin.reducer).toBe("function");
    expect(typeof boggle4x4Plugin.isTerminal).toBe("function");
    expect(boggle4x4Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = boggle4x4Plugin.initialState(42, S);
    const b = boggle4x4Plugin.initialState(42, S);
    const aPrompts = a.rounds.map((r) => r.prompt).join("|");
    const bPrompts = b.rounds.map((r) => r.prompt).join("|");
    expect(aPrompts).toBe(bPrompts);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(boggle4x4Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when game is done", () => {
    expect(typeof boggle4x4Plugin.hint).toBe("function");
    const state = boggle4x4Plugin.initialState(5, S);
    const result = boggle4x4Plugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-boggle-4x4-answer-0"]');
    expect(result!.pulses).toBe(3);

    const done: GameState = { ...state, phase: "done" };
    expect(boggle4x4Plugin.hint!(done)).toBeNull();
    expect(boggle4x4Plugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
