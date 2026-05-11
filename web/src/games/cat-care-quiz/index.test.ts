import { describe, it, expect } from "vitest";
import { catCareQuizPlugin } from "./index.js";
import type { CatCareQuizSettings } from "./state.js";

const S: CatCareQuizSettings = { questions: "10" };

describe("catCareQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(catCareQuizPlugin.id).toBe("cat-care-quiz");
    expect(catCareQuizPlugin.title).toBe("Cat Care Quiz");
    expect(catCareQuizPlugin.category).toBe("board");
    expect(catCareQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof catCareQuizPlugin.description).toBe("string");
    expect(catCareQuizPlugin.description.length).toBeGreaterThan(0);
    expect(catCareQuizPlugin.settings).toBeDefined();
    expect(catCareQuizPlugin.settings.questions.kind).toBe("enum");
    expect(catCareQuizPlugin.settings.questions.default).toBe("10");
    expect(catCareQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof catCareQuizPlugin.initialState).toBe("function");
    expect(typeof catCareQuizPlugin.reducer).toBe("function");
    expect(typeof catCareQuizPlugin.isTerminal).toBe("function");
    expect(typeof catCareQuizPlugin.hint).toBe("function");
    expect(catCareQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = catCareQuizPlugin.initialState(42, S);
    const b = catCareQuizPlugin.initialState(42, S);
    const c = catCareQuizPlugin.initialState(43, S);
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
    expect(catCareQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = catCareQuizPlugin.initialState(7, S);
    const target = catCareQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(catCareQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(catCareQuizPlugin.hint!(result)).toBeNull();
  });
});
