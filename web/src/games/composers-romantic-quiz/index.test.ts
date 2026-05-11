import { describe, it, expect } from "vitest";
import { composersRomanticQuizPlugin } from "./index.js";
import type { ComposersRomanticQuizSettings } from "./state.js";

const S: ComposersRomanticQuizSettings = { questions: "10" };

describe("composersRomanticQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(composersRomanticQuizPlugin.id).toBe("composers-romantic-quiz");
    expect(composersRomanticQuizPlugin.title).toBe("Romantic Composers Quiz");
    expect(composersRomanticQuizPlugin.category).toBe("board");
    expect(composersRomanticQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof composersRomanticQuizPlugin.description).toBe("string");
    expect(composersRomanticQuizPlugin.description.length).toBeGreaterThan(0);
    expect(composersRomanticQuizPlugin.settings).toBeDefined();
    expect(composersRomanticQuizPlugin.settings.questions.kind).toBe("enum");
    expect(composersRomanticQuizPlugin.settings.questions.default).toBe("10");
    expect(composersRomanticQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof composersRomanticQuizPlugin.initialState).toBe("function");
    expect(typeof composersRomanticQuizPlugin.reducer).toBe("function");
    expect(typeof composersRomanticQuizPlugin.isTerminal).toBe("function");
    expect(typeof composersRomanticQuizPlugin.hint).toBe("function");
    expect(composersRomanticQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = composersRomanticQuizPlugin.initialState(42, S);
    const b = composersRomanticQuizPlugin.initialState(42, S);
    const c = composersRomanticQuizPlugin.initialState(43, S);
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
    expect(composersRomanticQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = composersRomanticQuizPlugin.initialState(7, S);
    const target = composersRomanticQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(composersRomanticQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(composersRomanticQuizPlugin.hint!(result)).toBeNull();
  });
});
