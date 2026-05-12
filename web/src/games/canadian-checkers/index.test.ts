import { describe, it, expect } from "vitest";
import { canadianCheckersPlugin } from "./index.js";
import type { CanadianCheckersState } from "./state.js";

describe("canadianCheckersPlugin", () => {
  it("exposes plugin shape", () => {
    expect(canadianCheckersPlugin.id).toBe("canadian-checkers");
    expect(canadianCheckersPlugin.title).toBe("Canadian Checkers");
    expect(canadianCheckersPlugin.category).toBe("board");
    expect(canadianCheckersPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof canadianCheckersPlugin.initialState).toBe("function");
    expect(typeof canadianCheckersPlugin.reducer).toBe("function");
    expect(typeof canadianCheckersPlugin.isTerminal).toBe("function");
    expect(typeof canadianCheckersPlugin.hint).toBe("function");
    expect(canadianCheckersPlugin.component).toBeDefined();
  });

  it("produces deterministic initial state with isTerminal null", () => {
    const settings = { questions: "10" as const };
    const a = canadianCheckersPlugin.initialState(42, settings);
    const b = canadianCheckersPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.questions).toHaveLength(10);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(canadianCheckersPlugin.isTerminal!(a)).toBeNull();

    const done: CanadianCheckersState = { ...a, phase: "done", score: 250 };
    expect(canadianCheckersPlugin.isTerminal!(done)).toEqual({ score: 250 });
  });

  it("hint returns HintTarget while playing and null otherwise", () => {
    const settings = { questions: "10" as const };
    const state = canadianCheckersPlugin.initialState(7, settings);
    const target = canadianCheckersPlugin.hint!(state);
    expect(target).not.toBeNull();
    expect(target).toEqual({
      selector: '[data-testid="hint-target-canadian-checkers-answer-0"]',
      pulses: 3,
    });

    const doneState: CanadianCheckersState = { ...state, phase: "done" };
    expect(canadianCheckersPlugin.hint!(doneState)).toBeNull();
  });
});
