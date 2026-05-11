import { describe, it, expect } from "vitest";
import { desertsQuizPlugin } from "./index.js";
import type { QuizSettings } from "./state.js";

const S: QuizSettings = { questions: "10" };

describe("desertsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(desertsQuizPlugin.id).toBe("deserts-quiz");
    expect(desertsQuizPlugin.title).toBe("Deserts Quiz");
    expect(desertsQuizPlugin.category).toBe("board");
    expect(desertsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof desertsQuizPlugin.description).toBe("string");
    expect(desertsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(desertsQuizPlugin.settings).toBeDefined();
    expect(desertsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(desertsQuizPlugin.settings.questions.default).toBe("10");
    expect(desertsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof desertsQuizPlugin.initialState).toBe("function");
    expect(typeof desertsQuizPlugin.reducer).toBe("function");
    expect(typeof desertsQuizPlugin.isTerminal).toBe("function");
    expect(typeof desertsQuizPlugin.hint).toBe("function");
    expect(desertsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = desertsQuizPlugin.initialState(42, S);
    const b = desertsQuizPlugin.initialState(42, S);
    const c = desertsQuizPlugin.initialState(43, S);
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
    expect(desertsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = desertsQuizPlugin.initialState(7, S);
    const target = desertsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(desertsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(desertsQuizPlugin.hint!(result)).toBeNull();
  });
});
