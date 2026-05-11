import { describe, it, expect } from "vitest";
import { abaloneQuizPlugin } from "./index.js";
import type { AbaloneQuizSettings } from "./state.js";

const S: AbaloneQuizSettings = { questions: "10" };

describe("abaloneQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(abaloneQuizPlugin.id).toBe("abalone-quiz");
    expect(abaloneQuizPlugin.title).toBe("Abalone Quiz");
    expect(abaloneQuizPlugin.category).toBe("board");
    expect(abaloneQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof abaloneQuizPlugin.description).toBe("string");
    expect(abaloneQuizPlugin.description.length).toBeGreaterThan(0);
    expect(abaloneQuizPlugin.settings).toBeDefined();
    expect(abaloneQuizPlugin.settings.questions.kind).toBe("enum");
    expect(abaloneQuizPlugin.settings.questions.default).toBe("10");
    expect(abaloneQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof abaloneQuizPlugin.initialState).toBe("function");
    expect(typeof abaloneQuizPlugin.reducer).toBe("function");
    expect(typeof abaloneQuizPlugin.isTerminal).toBe("function");
    expect(typeof abaloneQuizPlugin.hint).toBe("function");
    expect(abaloneQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = abaloneQuizPlugin.initialState(42, S);
    const b = abaloneQuizPlugin.initialState(42, S);
    const c = abaloneQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text and same choice ordering
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    // fresh state is not terminal
    expect(abaloneQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = abaloneQuizPlugin.initialState(7, S);
    const target = abaloneQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -- hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(abaloneQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(abaloneQuizPlugin.hint!(result)).toBeNull();
  });
});
