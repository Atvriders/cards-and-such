import { describe, it, expect } from "vitest";
import { nineteen70sQuizPlugin } from "./index.js";
import type { Nineteen70sQuizSettings } from "./state.js";

const S: Nineteen70sQuizSettings = { questions: "10" };

describe("nineteen70sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen70sQuizPlugin.id).toBe("1970s-quiz");
    expect(nineteen70sQuizPlugin.title).toBe("1970s Disco Era Quiz");
    expect(nineteen70sQuizPlugin.category).toBe("board");
    expect(nineteen70sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen70sQuizPlugin.description).toBe("string");
    expect(nineteen70sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof nineteen70sQuizPlugin.howToPlay).toBe("string");
    expect(nineteen70sQuizPlugin.settings).toBeDefined();
    expect(nineteen70sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen70sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen70sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen70sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen70sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen70sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen70sQuizPlugin.hint).toBe("function");
    expect(nineteen70sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = nineteen70sQuizPlugin.initialState(42, S);
    const b = nineteen70sQuizPlugin.initialState(42, S);
    const c = nineteen70sQuizPlugin.initialState(43, S);
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
    expect(nineteen70sQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen70sQuizPlugin.initialState(7, S);
    const target = nineteen70sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(nineteen70sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen70sQuizPlugin.hint!(result)).toBeNull();
  });
});
