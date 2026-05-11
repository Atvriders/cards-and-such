import { describe, it, expect } from "vitest";
import { adjectiveQuizPlugin } from "./index.js";
import type { AdjectiveQuizSettings } from "./state.js";

const S: AdjectiveQuizSettings = { questions: "10" };

describe("adjectiveQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(adjectiveQuizPlugin.id).toBe("adjective-quiz");
    expect(adjectiveQuizPlugin.title).toBe("Adjective Quiz");
    expect(adjectiveQuizPlugin.category).toBe("board");
    expect(adjectiveQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof adjectiveQuizPlugin.description).toBe("string");
    expect(adjectiveQuizPlugin.description.length).toBeGreaterThan(0);
    expect(adjectiveQuizPlugin.settings).toBeDefined();
    expect(adjectiveQuizPlugin.settings.questions.kind).toBe("enum");
    expect(adjectiveQuizPlugin.settings.questions.default).toBe("10");
    expect(adjectiveQuizPlugin.settings.questions.options).toEqual(["8", "10", "12"]);
    expect(typeof adjectiveQuizPlugin.initialState).toBe("function");
    expect(typeof adjectiveQuizPlugin.reducer).toBe("function");
    expect(typeof adjectiveQuizPlugin.isTerminal).toBe("function");
    expect(typeof adjectiveQuizPlugin.hint).toBe("function");
    expect(adjectiveQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = adjectiveQuizPlugin.initialState(42, S);
    const b = adjectiveQuizPlugin.initialState(42, S);
    const c = adjectiveQuizPlugin.initialState(43, S);
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
    expect(adjectiveQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = adjectiveQuizPlugin.initialState(7, S);
    const target = adjectiveQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(adjectiveQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(adjectiveQuizPlugin.hint!(result)).toBeNull();
  });
});
