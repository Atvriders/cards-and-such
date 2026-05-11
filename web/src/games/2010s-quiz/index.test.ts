import { describe, it, expect } from "vitest";
import { twentyTensQuizPlugin } from "./index.js";
import type { TwentyTensQuizSettings } from "./state.js";

const S: TwentyTensQuizSettings = { questions: "10" };

describe("twentyTensQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(twentyTensQuizPlugin.id).toBe("2010s-quiz");
    expect(twentyTensQuizPlugin.title).toBe("2010s Social Media Era Quiz");
    expect(twentyTensQuizPlugin.category).toBe("board");
    expect(twentyTensQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof twentyTensQuizPlugin.description).toBe("string");
    expect(twentyTensQuizPlugin.description.length).toBeGreaterThan(0);
    expect(twentyTensQuizPlugin.settings).toBeDefined();
    expect(twentyTensQuizPlugin.settings.questions.kind).toBe("enum");
    expect(twentyTensQuizPlugin.settings.questions.default).toBe("10");
    expect(twentyTensQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof twentyTensQuizPlugin.initialState).toBe("function");
    expect(typeof twentyTensQuizPlugin.reducer).toBe("function");
    expect(typeof twentyTensQuizPlugin.isTerminal).toBe("function");
    expect(typeof twentyTensQuizPlugin.hint).toBe("function");
    expect(twentyTensQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = twentyTensQuizPlugin.initialState(42, S);
    const b = twentyTensQuizPlugin.initialState(42, S);
    const c = twentyTensQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(twentyTensQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = twentyTensQuizPlugin.initialState(7, S);
    const target = twentyTensQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(twentyTensQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(twentyTensQuizPlugin.hint!(result)).toBeNull();
  });
});
