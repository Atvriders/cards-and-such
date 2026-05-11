import { describe, it, expect } from "vitest";
import { amazonHistoryQuizPlugin } from "./index.js";
import type { AmazonHistoryQuizSettings } from "./state.js";

const S: AmazonHistoryQuizSettings = { questions: "10" };

describe("amazonHistoryQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(amazonHistoryQuizPlugin.id).toBe("amazon-history-quiz");
    expect(amazonHistoryQuizPlugin.title).toBe("Amazon History Quiz");
    expect(amazonHistoryQuizPlugin.category).toBe("board");
    expect(amazonHistoryQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof amazonHistoryQuizPlugin.description).toBe("string");
    expect(amazonHistoryQuizPlugin.description.length).toBeGreaterThan(0);
    expect(amazonHistoryQuizPlugin.settings).toBeDefined();
    expect(amazonHistoryQuizPlugin.settings.questions.kind).toBe("enum");
    expect(amazonHistoryQuizPlugin.settings.questions.default).toBe("10");
    expect(amazonHistoryQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof amazonHistoryQuizPlugin.initialState).toBe("function");
    expect(typeof amazonHistoryQuizPlugin.reducer).toBe("function");
    expect(typeof amazonHistoryQuizPlugin.isTerminal).toBe("function");
    expect(typeof amazonHistoryQuizPlugin.hint).toBe("function");
    expect(amazonHistoryQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = amazonHistoryQuizPlugin.initialState(42, S);
    const b = amazonHistoryQuizPlugin.initialState(42, S);
    const c = amazonHistoryQuizPlugin.initialState(43, S);
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
    expect(amazonHistoryQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = amazonHistoryQuizPlugin.initialState(7, S);
    const target = amazonHistoryQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(amazonHistoryQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(amazonHistoryQuizPlugin.hint!(result)).toBeNull();
  });
});
