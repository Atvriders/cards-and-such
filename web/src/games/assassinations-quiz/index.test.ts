import { describe, it, expect } from "vitest";
import { assassinationsQuizPlugin } from "./index.js";
import type { AssassinationsQuizSettings } from "./state.js";

const S: AssassinationsQuizSettings = { questions: "10" };

describe("assassinationsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(assassinationsQuizPlugin.id).toBe("assassinations-quiz");
    expect(assassinationsQuizPlugin.title).toBe("Famous Assassinations Quiz");
    expect(assassinationsQuizPlugin.category).toBe("board");
    expect(assassinationsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof assassinationsQuizPlugin.description).toBe("string");
    expect(assassinationsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(assassinationsQuizPlugin.settings).toBeDefined();
    expect(assassinationsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(assassinationsQuizPlugin.settings.questions.default).toBe("10");
    expect(assassinationsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof assassinationsQuizPlugin.initialState).toBe("function");
    expect(typeof assassinationsQuizPlugin.reducer).toBe("function");
    expect(typeof assassinationsQuizPlugin.isTerminal).toBe("function");
    expect(typeof assassinationsQuizPlugin.hint).toBe("function");
    expect(assassinationsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = assassinationsQuizPlugin.initialState(42, S);
    const b = assassinationsQuizPlugin.initialState(42, S);
    const c = assassinationsQuizPlugin.initialState(43, S);
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
    expect(assassinationsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = assassinationsQuizPlugin.initialState(7, S);
    const target = assassinationsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(assassinationsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(assassinationsQuizPlugin.hint!(result)).toBeNull();
  });
});
