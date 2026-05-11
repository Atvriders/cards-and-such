import { describe, it, expect } from "vitest";
import { americanCivilWarQuizPlugin } from "./index.js";
import type { AmericanCivilWarQuizSettings } from "./state.js";

const S: AmericanCivilWarQuizSettings = { questions: "10" };

describe("americanCivilWarQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(americanCivilWarQuizPlugin.id).toBe("american-civil-war-quiz");
    expect(americanCivilWarQuizPlugin.title).toBe("American Civil War Quiz");
    expect(americanCivilWarQuizPlugin.category).toBe("board");
    expect(americanCivilWarQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof americanCivilWarQuizPlugin.description).toBe("string");
    expect(americanCivilWarQuizPlugin.description.length).toBeGreaterThan(0);
    expect(americanCivilWarQuizPlugin.settings).toBeDefined();
    expect(americanCivilWarQuizPlugin.settings.questions.kind).toBe("enum");
    expect(americanCivilWarQuizPlugin.settings.questions.default).toBe("10");
    expect(americanCivilWarQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof americanCivilWarQuizPlugin.initialState).toBe("function");
    expect(typeof americanCivilWarQuizPlugin.reducer).toBe("function");
    expect(typeof americanCivilWarQuizPlugin.isTerminal).toBe("function");
    expect(typeof americanCivilWarQuizPlugin.hint).toBe("function");
    expect(americanCivilWarQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = americanCivilWarQuizPlugin.initialState(42, S);
    const b = americanCivilWarQuizPlugin.initialState(42, S);
    const c = americanCivilWarQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(americanCivilWarQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = americanCivilWarQuizPlugin.initialState(7, S);
    const target = americanCivilWarQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(americanCivilWarQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(americanCivilWarQuizPlugin.hint!(result)).toBeNull();
  });
});
