import { describe, it, expect } from "vitest";
import { comparativeQuizPlugin } from "./index.js";
import type { ComparativeQuizSettings } from "./state.js";

const S: ComparativeQuizSettings = { questions: "10" };

describe("comparativeQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(comparativeQuizPlugin.id).toBe("comparative-quiz");
    expect(comparativeQuizPlugin.title).toBe("Comparative Quiz");
    expect(comparativeQuizPlugin.category).toBe("board");
    expect(comparativeQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof comparativeQuizPlugin.description).toBe("string");
    expect(comparativeQuizPlugin.description.length).toBeGreaterThan(0);
    expect(comparativeQuizPlugin.settings).toBeDefined();
    expect(comparativeQuizPlugin.settings.questions.kind).toBe("enum");
    expect(comparativeQuizPlugin.settings.questions.default).toBe("10");
    expect(comparativeQuizPlugin.settings.questions.options).toEqual(["8", "10", "12"]);
    expect(typeof comparativeQuizPlugin.initialState).toBe("function");
    expect(typeof comparativeQuizPlugin.reducer).toBe("function");
    expect(typeof comparativeQuizPlugin.isTerminal).toBe("function");
    expect(typeof comparativeQuizPlugin.hint).toBe("function");
    expect(comparativeQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = comparativeQuizPlugin.initialState(42, S);
    const b = comparativeQuizPlugin.initialState(42, S);
    const c = comparativeQuizPlugin.initialState(43, S);
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
    expect(comparativeQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = comparativeQuizPlugin.initialState(7, S);
    const target = comparativeQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(comparativeQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(comparativeQuizPlugin.hint!(result)).toBeNull();
  });
});
