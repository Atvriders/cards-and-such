import { describe, it, expect } from "vitest";
import { nineteen60sQuizPlugin } from "./index.js";
import type { Nineteen60sQuizSettings } from "./state.js";

const S: Nineteen60sQuizSettings = { questions: "10" };

describe("nineteen60sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen60sQuizPlugin.id).toBe("1960s-quiz");
    expect(nineteen60sQuizPlugin.title).toBe("1960s Counterculture Quiz");
    expect(nineteen60sQuizPlugin.category).toBe("board");
    expect(nineteen60sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen60sQuizPlugin.description).toBe("string");
    expect(nineteen60sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof nineteen60sQuizPlugin.howToPlay).toBe("string");
    expect(nineteen60sQuizPlugin.settings).toBeDefined();
    expect(nineteen60sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen60sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen60sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen60sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen60sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen60sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen60sQuizPlugin.hint).toBe("function");
    expect(nineteen60sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = nineteen60sQuizPlugin.initialState(42, S);
    const b = nineteen60sQuizPlugin.initialState(42, S);
    const c = nineteen60sQuizPlugin.initialState(43, S);
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
    expect(nineteen60sQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen60sQuizPlugin.initialState(7, S);
    const target = nineteen60sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(nineteen60sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen60sQuizPlugin.hint!(result)).toBeNull();
  });
});
