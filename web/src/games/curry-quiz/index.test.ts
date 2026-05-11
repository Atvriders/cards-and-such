import { describe, it, expect } from "vitest";
import { curryQuizPlugin } from "./index.js";
import type { CurryQuizState } from "./state.js";

describe("curryQuizPlugin", () => {
  it("has correct plugin shape", () => {
    expect(curryQuizPlugin.id).toBe("curry-quiz");
    expect(curryQuizPlugin.title).toBe("Curry Quiz");
    expect(curryQuizPlugin.category).toBe("board");
    expect(curryQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof curryQuizPlugin.initialState).toBe("function");
    expect(typeof curryQuizPlugin.reducer).toBe("function");
    expect(typeof curryQuizPlugin.isTerminal).toBe("function");
    expect(typeof curryQuizPlugin.hint).toBe("function");
    expect(curryQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for same seed and isTerminal is null at start", () => {
    const s1 = curryQuizPlugin.initialState(42, { questions: "10" });
    const s2 = curryQuizPlugin.initialState(42, { questions: "10" });
    expect(s1).toEqual(s2);
    expect(s1.phase).toBe("playing");
    expect(s1.currentIndex).toBe(0);
    expect(s1.selected).toBeNull();
    expect(s1.submitted).toBe(false);
    expect(s1.timeLeft).toBe(15);
    expect(s1.score).toBe(0);
    expect(s1.correctCount).toBe(0);
    expect(s1.questions).toHaveLength(10);
    expect(curryQuizPlugin.isTerminal!(s1)).toBeNull();

    const s20 = curryQuizPlugin.initialState(7, { questions: "20" });
    expect(s20.questions).toHaveLength(20);
  });

  it("hint returns HintTarget when playing and null otherwise", () => {
    const playing = curryQuizPlugin.initialState(1, { questions: "10" });
    const hint = curryQuizPlugin.hint!(playing);
    expect(hint).not.toBeNull();
    expect(hint).toEqual({ selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 });

    const done: CurryQuizState = { ...playing, phase: "done" };
    expect(curryQuizPlugin.hint!(done)).toBeNull();

    const result: CurryQuizState = { ...playing, phase: "result" };
    expect(curryQuizPlugin.hint!(result)).toBeNull();
  });
});
