import { describe, it, expect } from "vitest";
import { abbreviationQuizPlugin } from "./index.js";
import type { AbbreviationQuizSettings } from "./state.js";

const S: AbbreviationQuizSettings = { questions: "8" };

describe("abbreviationQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(abbreviationQuizPlugin.id).toBe("abbreviation-quiz");
    expect(abbreviationQuizPlugin.title).toBe("Abbreviation Quiz");
    expect(abbreviationQuizPlugin.category).toBe("board");
    expect(abbreviationQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof abbreviationQuizPlugin.description).toBe("string");
    expect(abbreviationQuizPlugin.description.length).toBeGreaterThan(0);
    expect(abbreviationQuizPlugin.settings).toBeDefined();
    expect(abbreviationQuizPlugin.settings.questions.kind).toBe("enum");
    expect(abbreviationQuizPlugin.settings.questions.default).toBe("8");
    expect(abbreviationQuizPlugin.settings.questions.options).toEqual(["8", "12"]);
    expect(typeof abbreviationQuizPlugin.initialState).toBe("function");
    expect(typeof abbreviationQuizPlugin.reducer).toBe("function");
    expect(typeof abbreviationQuizPlugin.isTerminal).toBe("function");
    expect(typeof abbreviationQuizPlugin.hint).toBe("function");
    expect(abbreviationQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = abbreviationQuizPlugin.initialState(42, S);
    const b = abbreviationQuizPlugin.initialState(42, S);
    const c = abbreviationQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(8);
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
    expect(abbreviationQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = abbreviationQuizPlugin.initialState(7, S);
    const target = abbreviationQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -- hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(abbreviationQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(abbreviationQuizPlugin.hint!(result)).toBeNull();
  });
});
