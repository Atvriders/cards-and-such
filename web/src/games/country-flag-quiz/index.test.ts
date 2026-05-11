import { describe, it, expect } from "vitest";
import { countryFlagQuizPlugin } from "./index.js";
import type { CountryFlagQuizSettings } from "./state.js";

const S: CountryFlagQuizSettings = { questions: "10" };

describe("countryFlagQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(countryFlagQuizPlugin.id).toBe("country-flag-quiz");
    expect(countryFlagQuizPlugin.title).toBe("Country Flag Quiz");
    expect(countryFlagQuizPlugin.category).toBe("board");
    expect(countryFlagQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof countryFlagQuizPlugin.description).toBe("string");
    expect(countryFlagQuizPlugin.description.length).toBeGreaterThan(0);
    expect(countryFlagQuizPlugin.settings).toBeDefined();
    expect(countryFlagQuizPlugin.settings.questions.kind).toBe("enum");
    expect(countryFlagQuizPlugin.settings.questions.default).toBe("10");
    expect(countryFlagQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof countryFlagQuizPlugin.initialState).toBe("function");
    expect(typeof countryFlagQuizPlugin.reducer).toBe("function");
    expect(typeof countryFlagQuizPlugin.isTerminal).toBe("function");
    expect(typeof countryFlagQuizPlugin.hint).toBe("function");
    expect(countryFlagQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = countryFlagQuizPlugin.initialState(42, S);
    const b = countryFlagQuizPlugin.initialState(42, S);
    const c = countryFlagQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    // each question's correct index points to a valid choice
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    expect(countryFlagQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = countryFlagQuizPlugin.initialState(7, S);
    const target = countryFlagQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(countryFlagQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(countryFlagQuizPlugin.hint!(result)).toBeNull();
  });
});
