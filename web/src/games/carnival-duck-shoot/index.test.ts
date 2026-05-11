import { describe, it, expect } from "vitest";
import { carnivalDuckShootPlugin } from "./index.js";
import type { GameState } from "./state.js";

describe("carnival-duck-shoot plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carnivalDuckShootPlugin.id).toBe("carnival-duck-shoot");
    expect(carnivalDuckShootPlugin.title).toBe("Carnival Duck Shoot");
    expect(carnivalDuckShootPlugin.category).toBe("board");
    expect(carnivalDuckShootPlugin.players.min).toBe(1);
    expect(carnivalDuckShootPlugin.players.max).toBe(1);
    expect(carnivalDuckShootPlugin.players.multiplayer).toBe(false);
    expect(typeof carnivalDuckShootPlugin.initialState).toBe("function");
    expect(typeof carnivalDuckShootPlugin.reducer).toBe("function");
    expect(typeof carnivalDuckShootPlugin.isTerminal).toBe("function");
    expect(typeof carnivalDuckShootPlugin.hint).toBe("function");
    expect(carnivalDuckShootPlugin.settings).toBeDefined();
  });

  it("produces a deterministic initialState and isTerminal returns null while playing", () => {
    const a = carnivalDuckShootPlugin.initialState(42, { rounds: "8" });
    const b = carnivalDuckShootPlugin.initialState(42, { rounds: "8" });
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.rounds.length).toBe(8);
    for (const r of a.rounds) {
      expect(r.choices.length).toBe(4);
      expect([0, 1, 2, 3]).toContain(r.correct);
    }
    expect(carnivalDuckShootPlugin.isTerminal!(a)).toBeNull();

    const doneState: GameState = { ...a, phase: "done", score: 200 };
    expect(carnivalDuckShootPlugin.isTerminal!(doneState)).toEqual({ score: 200 });
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const state = carnivalDuckShootPlugin.initialState(7, { rounds: "5" });
    const playingHint = carnivalDuckShootPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-carnival-duck-shoot-answer-0"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState: GameState = { ...state, phase: "done" };
    expect(carnivalDuckShootPlugin.hint!(doneState)).toBeNull();

    const resultState: GameState = { ...state, phase: "result" };
    expect(carnivalDuckShootPlugin.hint!(resultState)).toBeNull();
  });
});
