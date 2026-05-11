import { describe, it, expect } from "vitest";
import { appleHistoryQuizPlugin } from "./index.js";
import type { AppleHistoryQuizSettings } from "./state.js";

const S: AppleHistoryQuizSettings = { questions: "10" };

describe("appleHistoryQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(appleHistoryQuizPlugin.id).toBe("apple-history-quiz");
    expect(appleHistoryQuizPlugin.title).toBe("Apple History Quiz");
    expect(appleHistoryQuizPlugin.category).toBe("board");
    expect(appleHistoryQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof appleHistoryQuizPlugin.description).toBe("string");
    expect(appleHistoryQuizPlugin.description.length).toBeGreaterThan(0);
    expect(appleHistoryQuizPlugin.settings).toBeDefined();
    expect(appleHistoryQuizPlugin.settings.questions.kind).toBe("enum");
    expect(appleHistoryQuizPlugin.settings.questions.default).toBe("10");
    expect(appleHistoryQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof appleHistoryQuizPlugin.initialState).toBe("function");
    expect(typeof appleHistoryQuizPlugin.reducer).toBe("function");
    expect(typeof appleHistoryQuizPlugin.isTerminal).toBe("function");
    expect(typeof appleHistoryQuizPlugin.hint).toBe("function");
    expect(appleHistoryQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = appleHistoryQuizPlugin.initialState(42, S);
    const b = appleHistoryQuizPlugin.initialState(42, S);
    const c = appleHistoryQuizPlugin.initialState(43, S);
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
    expect(appleHistoryQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = appleHistoryQuizPlugin.initialState(7, S);
    const target = appleHistoryQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(appleHistoryQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(appleHistoryQuizPlugin.hint!(result)).toBeNull();
  });
});
