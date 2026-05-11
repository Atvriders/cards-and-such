import { describe, it, expect } from "vitest";
import { contractionQuizPlugin } from "./index.js";
import type { ContractionQuizSettings } from "./state.js";

const S: ContractionQuizSettings = { questions: "10" };

describe("contractionQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(contractionQuizPlugin.id).toBe("contraction-quiz");
    expect(contractionQuizPlugin.title).toBe("Contraction Quiz");
    expect(contractionQuizPlugin.category).toBe("board");
    expect(contractionQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof contractionQuizPlugin.description).toBe("string");
    expect(contractionQuizPlugin.description.length).toBeGreaterThan(0);
    expect(contractionQuizPlugin.settings).toBeDefined();
    expect(contractionQuizPlugin.settings.questions.kind).toBe("enum");
    expect(contractionQuizPlugin.settings.questions.default).toBe("10");
    expect(contractionQuizPlugin.settings.questions.options).toEqual(["8", "10", "12"]);
    expect(typeof contractionQuizPlugin.initialState).toBe("function");
    expect(typeof contractionQuizPlugin.reducer).toBe("function");
    expect(typeof contractionQuizPlugin.isTerminal).toBe("function");
    expect(typeof contractionQuizPlugin.hint).toBe("function");
    expect(contractionQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = contractionQuizPlugin.initialState(42, S);
    const b = contractionQuizPlugin.initialState(42, S);
    const c = contractionQuizPlugin.initialState(43, S);
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
    // each question should have a valid correct index in [0,3] and 4 choices
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(contractionQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = contractionQuizPlugin.initialState(7, S);
    const target = contractionQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(contractionQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(contractionQuizPlugin.hint!(result)).toBeNull();
  });
});
