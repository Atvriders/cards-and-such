import { describe, it, expect } from "vitest";
import { acronymDefineQuizPlugin } from "./index.js";
import type { AcronymDefineQuizSettings } from "./state.js";

const S: AcronymDefineQuizSettings = { questions: "8" };

describe("acronymDefineQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(acronymDefineQuizPlugin.id).toBe("acronym-define-quiz");
    expect(acronymDefineQuizPlugin.title).toBe("Acronym Define Quiz");
    expect(acronymDefineQuizPlugin.category).toBe("board");
    expect(acronymDefineQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acronymDefineQuizPlugin.description).toBe("string");
    expect(acronymDefineQuizPlugin.description.length).toBeGreaterThan(0);
    expect(acronymDefineQuizPlugin.settings).toBeDefined();
    expect(acronymDefineQuizPlugin.settings.questions.kind).toBe("enum");
    expect(acronymDefineQuizPlugin.settings.questions.default).toBe("8");
    expect(acronymDefineQuizPlugin.settings.questions.options).toEqual(["8", "12"]);
    expect(typeof acronymDefineQuizPlugin.initialState).toBe("function");
    expect(typeof acronymDefineQuizPlugin.reducer).toBe("function");
    expect(typeof acronymDefineQuizPlugin.isTerminal).toBe("function");
    expect(typeof acronymDefineQuizPlugin.hint).toBe("function");
    expect(acronymDefineQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = acronymDefineQuizPlugin.initialState(42, S);
    const b = acronymDefineQuizPlugin.initialState(42, S);
    const c = acronymDefineQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(8);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // each question should have a valid correct index in [0,3]
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(acronymDefineQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = acronymDefineQuizPlugin.initialState(7, S);
    const target = acronymDefineQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(acronymDefineQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(acronymDefineQuizPlugin.hint!(result)).toBeNull();
  });
});
