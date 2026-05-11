import { describe, it, expect } from "vitest";
import { algebraQuizPlugin } from "./index.js";
import type { AlgebraQuizSettings } from "./state.js";

const S: AlgebraQuizSettings = { questions: "10" };

describe("algebraQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(algebraQuizPlugin.id).toBe("algebra-quiz");
    expect(algebraQuizPlugin.title).toBe("Algebra Quiz");
    expect(algebraQuizPlugin.category).toBe("board");
    expect(algebraQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof algebraQuizPlugin.description).toBe("string");
    expect(algebraQuizPlugin.description.length).toBeGreaterThan(0);
    expect(algebraQuizPlugin.settings).toBeDefined();
    expect(algebraQuizPlugin.settings.questions.kind).toBe("enum");
    expect(algebraQuizPlugin.settings.questions.default).toBe("10");
    expect(algebraQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof algebraQuizPlugin.initialState).toBe("function");
    expect(typeof algebraQuizPlugin.reducer).toBe("function");
    expect(typeof algebraQuizPlugin.isTerminal).toBe("function");
    expect(typeof algebraQuizPlugin.hint).toBe("function");
    expect(algebraQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = algebraQuizPlugin.initialState(42, S);
    const b = algebraQuizPlugin.initialState(42, S);
    const c = algebraQuizPlugin.initialState(43, S);
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
    expect(algebraQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = algebraQuizPlugin.initialState(7, S);
    const target = algebraQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(algebraQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(algebraQuizPlugin.hint!(result)).toBeNull();
  });
});
