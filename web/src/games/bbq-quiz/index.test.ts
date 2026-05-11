import { describe, it, expect } from "vitest";
import { bbqQuizPlugin } from "./index.js";
import type { BBQQuizSettings } from "./state.js";

const S: BBQQuizSettings = { questions: "10" };

describe("bbqQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bbqQuizPlugin.id).toBe("bbq-quiz");
    expect(bbqQuizPlugin.title).toBe("BBQ Quiz");
    expect(bbqQuizPlugin.category).toBe("board");
    expect(bbqQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bbqQuizPlugin.description).toBe("string");
    expect(bbqQuizPlugin.description.length).toBeGreaterThan(0);
    expect(bbqQuizPlugin.settings).toBeDefined();
    expect(bbqQuizPlugin.settings.questions.kind).toBe("enum");
    expect(bbqQuizPlugin.settings.questions.default).toBe("10");
    expect(bbqQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof bbqQuizPlugin.initialState).toBe("function");
    expect(typeof bbqQuizPlugin.reducer).toBe("function");
    expect(typeof bbqQuizPlugin.isTerminal).toBe("function");
    expect(typeof bbqQuizPlugin.hint).toBe("function");
    expect(bbqQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bbqQuizPlugin.initialState(42, S);
    const b = bbqQuizPlugin.initialState(42, S);
    const c = bbqQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.timeLeft).toBe(15);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.correctCount).toBe(0);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(bbqQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bbqQuizPlugin.initialState(7, S);
    const target = bbqQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(bbqQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bbqQuizPlugin.hint!(result)).toBeNull();
  });
});
