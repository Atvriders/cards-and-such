import { describe, it, expect } from "vitest";
import { nineteen90sQuizPlugin } from "./index.js";
import type { Nineteen90sQuizSettings } from "./state.js";

const S: Nineteen90sQuizSettings = { questions: "10" };

describe("nineteen90sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen90sQuizPlugin.id).toBe("1990s-quiz");
    expect(nineteen90sQuizPlugin.title).toBe("1990s Internet Boom Quiz");
    expect(nineteen90sQuizPlugin.category).toBe("board");
    expect(nineteen90sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen90sQuizPlugin.description).toBe("string");
    expect(nineteen90sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof nineteen90sQuizPlugin.howToPlay).toBe("string");
    expect(nineteen90sQuizPlugin.settings).toBeDefined();
    expect(nineteen90sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen90sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen90sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen90sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen90sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen90sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen90sQuizPlugin.hint).toBe("function");
    expect(nineteen90sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = nineteen90sQuizPlugin.initialState(42, S);
    const b = nineteen90sQuizPlugin.initialState(42, S);
    const c = nineteen90sQuizPlugin.initialState(43, S);
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
    expect(nineteen90sQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen90sQuizPlugin.initialState(7, S);
    const target = nineteen90sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(nineteen90sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen90sQuizPlugin.hint!(result)).toBeNull();
  });
});
