import { describe, it, expect } from "vitest";
import { astronomyQuizPlugin } from "./index.js";
import type { AstronomyQuizSettings, AstronomyQuizState } from "./state.js";

const S: AstronomyQuizSettings = { questions: "10" };

describe("astronomyQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(astronomyQuizPlugin.id).toBe("astronomy-quiz");
    expect(astronomyQuizPlugin.title).toBe("Astronomy Quiz");
    expect(astronomyQuizPlugin.category).toBe("board");
    expect(astronomyQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof astronomyQuizPlugin.description).toBe("string");
    expect(astronomyQuizPlugin.description.length).toBeGreaterThan(0);
    expect(astronomyQuizPlugin.settings).toBeDefined();
    expect(astronomyQuizPlugin.settings.questions.kind).toBe("enum");
    expect(astronomyQuizPlugin.settings.questions.default).toBe("10");
    expect(astronomyQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof astronomyQuizPlugin.initialState).toBe("function");
    expect(typeof astronomyQuizPlugin.reducer).toBe("function");
    expect(typeof astronomyQuizPlugin.isTerminal).toBe("function");
    expect(typeof astronomyQuizPlugin.hint).toBe("function");
    expect(astronomyQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = astronomyQuizPlugin.initialState(42, S);
    const b = astronomyQuizPlugin.initialState(42, S);
    const c = astronomyQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text and choices
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering of questions or choices
    const identical = a.questions.every(
      (q, i) =>
        q.question === c.questions[i]!.question &&
        q.choices.every((ch, j) => ch === c.questions[i]!.choices[j]),
    );
    expect(identical).toBe(false);
    // every chosen correct index must point to a real choice slot
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    expect(astronomyQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = astronomyQuizPlugin.initialState(7, S);
    const target = astronomyQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: AstronomyQuizState = { ...playing, phase: "done" };
    expect(astronomyQuizPlugin.hint!(done)).toBeNull();

    const result: AstronomyQuizState = { ...playing, phase: "result" };
    expect(astronomyQuizPlugin.hint!(result)).toBeNull();
  });
});
