import { describe, it, expect } from "vitest";
import { classicNovelsQuizPlugin } from "./index.js";
import type { ClassicNovelsQuizSettings } from "./state.js";

const S: ClassicNovelsQuizSettings = { questions: "10" };

describe("classicNovelsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(classicNovelsQuizPlugin.id).toBe("classic-novels-quiz");
    expect(classicNovelsQuizPlugin.title).toBe("Classic Novels Quiz");
    expect(classicNovelsQuizPlugin.category).toBe("board");
    expect(classicNovelsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof classicNovelsQuizPlugin.description).toBe("string");
    expect(classicNovelsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof classicNovelsQuizPlugin.howToPlay).toBe("string");
    expect(classicNovelsQuizPlugin.settings).toBeDefined();
    expect(classicNovelsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(classicNovelsQuizPlugin.settings.questions.default).toBe("10");
    expect(classicNovelsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof classicNovelsQuizPlugin.initialState).toBe("function");
    expect(typeof classicNovelsQuizPlugin.reducer).toBe("function");
    expect(typeof classicNovelsQuizPlugin.isTerminal).toBe("function");
    expect(typeof classicNovelsQuizPlugin.hint).toBe("function");
    expect(classicNovelsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = classicNovelsQuizPlugin.initialState(42, S);
    const b = classicNovelsQuizPlugin.initialState(42, S);
    const c = classicNovelsQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(classicNovelsQuizPlugin.isTerminal(a)).toBeNull();

    // 20-question setting honors the question count
    const twenty = classicNovelsQuizPlugin.initialState(1, { questions: "20" });
    expect(twenty.questions.length).toBe(20);

    // 30-question setting is capped to the pool size (pool has 30 items)
    const thirty = classicNovelsQuizPlugin.initialState(1, { questions: "30" });
    expect(thirty.questions.length).toBe(30);
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = classicNovelsQuizPlugin.initialState(7, S);
    const target = classicNovelsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(classicNovelsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(classicNovelsQuizPlugin.hint!(result)).toBeNull();
  });
});
