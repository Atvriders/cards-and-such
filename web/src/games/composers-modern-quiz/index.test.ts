import { describe, it, expect } from "vitest";
import { composersModernQuizPlugin } from "./index.js";

describe("composersModernQuizPlugin", () => {
  it("has correct plugin shape", () => {
    expect(composersModernQuizPlugin.id).toBe("composers-modern-quiz");
    expect(composersModernQuizPlugin.title).toBe("Modern Composers Quiz");
    expect(composersModernQuizPlugin.category).toBe("board");
    expect(composersModernQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof composersModernQuizPlugin.initialState).toBe("function");
    expect(typeof composersModernQuizPlugin.reducer).toBe("function");
    expect(typeof composersModernQuizPlugin.isTerminal).toBe("function");
    expect(typeof composersModernQuizPlugin.hint).toBe("function");
    expect(composersModernQuizPlugin.settings).toBeDefined();
  });

  it("initialState is deterministic with same seed and isTerminal is null at start", () => {
    const settings = { questions: "10" as const };
    const s1 = composersModernQuizPlugin.initialState(42, settings);
    const s2 = composersModernQuizPlugin.initialState(42, settings);
    expect(s1).toEqual(s2);
    expect(s1.questions.length).toBe(10);
    expect(s1.currentIndex).toBe(0);
    expect(s1.selected).toBeNull();
    expect(s1.submitted).toBe(false);
    expect(s1.timeLeft).toBe(15);
    expect(s1.score).toBe(0);
    expect(s1.correctCount).toBe(0);
    expect(s1.phase).toBe("playing");
    expect(composersModernQuizPlugin.isTerminal!(s1)).toBeNull();
  });

  it("hint returns HintTarget when playing and null otherwise", () => {
    const settings = { questions: "10" as const };
    const s = composersModernQuizPlugin.initialState(1, settings);
    const hint = composersModernQuizPlugin.hint!(s);
    expect(hint).not.toBeNull();
    expect(hint).toEqual({ selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 });

    const doneState = { ...s, phase: "done" as const };
    expect(composersModernQuizPlugin.hint!(doneState)).toBeNull();

    const resultState = { ...s, phase: "result" as const };
    expect(composersModernQuizPlugin.hint!(resultState)).toBeNull();
  });
});
