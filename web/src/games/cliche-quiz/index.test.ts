import { describe, it, expect } from "vitest";
import { clicheQuizPlugin } from "./index.js";
import type { ClicheQuizSettings } from "./state.js";

const S: ClicheQuizSettings = { questions: "10" };

describe("clicheQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(clicheQuizPlugin.id).toBe("cliche-quiz");
    expect(clicheQuizPlugin.title).toBe("Cliche Quiz");
    expect(clicheQuizPlugin.category).toBe("board");
    expect(clicheQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clicheQuizPlugin.description).toBe("string");
    expect(clicheQuizPlugin.description.length).toBeGreaterThan(0);
    expect(clicheQuizPlugin.settings).toBeDefined();
    expect(clicheQuizPlugin.settings.questions.kind).toBe("enum");
    expect(clicheQuizPlugin.settings.questions.default).toBe("10");
    expect(clicheQuizPlugin.settings.questions.options).toEqual(["8", "10", "12"]);
    expect(typeof clicheQuizPlugin.initialState).toBe("function");
    expect(typeof clicheQuizPlugin.reducer).toBe("function");
    expect(typeof clicheQuizPlugin.isTerminal).toBe("function");
    expect(typeof clicheQuizPlugin.hint).toBe("function");
    expect(clicheQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = clicheQuizPlugin.initialState(42, S);
    const b = clicheQuizPlugin.initialState(42, S);
    const c = clicheQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(clicheQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = clicheQuizPlugin.initialState(7, S);
    const target = clicheQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(clicheQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(clicheQuizPlugin.hint!(result)).toBeNull();
  });
});
