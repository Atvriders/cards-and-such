import { describe, it, expect } from "vitest";
import { nineteen30sQuizPlugin } from "./index.js";
import type { Nineteen30sQuizSettings } from "./state.js";

const S: Nineteen30sQuizSettings = { questions: "10" };

describe("nineteen30sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen30sQuizPlugin.id).toBe("1930s-quiz");
    expect(nineteen30sQuizPlugin.title).toBe("1930s Great Depression Quiz");
    expect(nineteen30sQuizPlugin.category).toBe("board");
    expect(nineteen30sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen30sQuizPlugin.description).toBe("string");
    expect(nineteen30sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(nineteen30sQuizPlugin.settings).toBeDefined();
    expect(nineteen30sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen30sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen30sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen30sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen30sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen30sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen30sQuizPlugin.hint).toBe("function");
    expect(nineteen30sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is false on a fresh state", () => {
    const a = nineteen30sQuizPlugin.initialState(42, S);
    const b = nineteen30sQuizPlugin.initialState(42, S);
    const c = nineteen30sQuizPlugin.initialState(43, S);
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
    expect(nineteen30sQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen30sQuizPlugin.initialState(7, S);
    const target = nineteen30sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(nineteen30sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen30sQuizPlugin.hint!(result)).toBeNull();
  });
});
