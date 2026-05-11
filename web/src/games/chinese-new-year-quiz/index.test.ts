import { describe, it, expect } from "vitest";
import { chineseNewYearQuizPlugin } from "./index.js";
import type { ChineseNewYearQuizSettings } from "./state.js";

const S: ChineseNewYearQuizSettings = { questions: "10" };

describe("chineseNewYearQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chineseNewYearQuizPlugin.id).toBe("chinese-new-year-quiz");
    expect(chineseNewYearQuizPlugin.title).toBe("Chinese New Year Quiz");
    expect(chineseNewYearQuizPlugin.category).toBe("board");
    expect(chineseNewYearQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chineseNewYearQuizPlugin.description).toBe("string");
    expect(chineseNewYearQuizPlugin.description.length).toBeGreaterThan(0);
    expect(chineseNewYearQuizPlugin.settings).toBeDefined();
    expect(chineseNewYearQuizPlugin.settings.questions.kind).toBe("enum");
    expect(chineseNewYearQuizPlugin.settings.questions.default).toBe("10");
    expect(chineseNewYearQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof chineseNewYearQuizPlugin.initialState).toBe("function");
    expect(typeof chineseNewYearQuizPlugin.reducer).toBe("function");
    expect(typeof chineseNewYearQuizPlugin.isTerminal).toBe("function");
    expect(typeof chineseNewYearQuizPlugin.hint).toBe("function");
    expect(chineseNewYearQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chineseNewYearQuizPlugin.initialState(42, S);
    const b = chineseNewYearQuizPlugin.initialState(42, S);
    const c = chineseNewYearQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(chineseNewYearQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chineseNewYearQuizPlugin.initialState(7, S);
    const target = chineseNewYearQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(chineseNewYearQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(chineseNewYearQuizPlugin.hint!(result)).toBeNull();
  });
});
