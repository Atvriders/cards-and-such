import { describe, it, expect } from "vitest";
import { americanLitQuizPlugin } from "./index.js";
import type { AmericanLitQuizSettings } from "./state.js";

const S: AmericanLitQuizSettings = { questions: "10" };

describe("americanLitQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(americanLitQuizPlugin.id).toBe("american-lit-quiz");
    expect(americanLitQuizPlugin.title).toBe("American Literature Quiz");
    expect(americanLitQuizPlugin.category).toBe("board");
    expect(americanLitQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof americanLitQuizPlugin.description).toBe("string");
    expect(americanLitQuizPlugin.description.length).toBeGreaterThan(0);
    expect(americanLitQuizPlugin.settings).toBeDefined();
    expect(americanLitQuizPlugin.settings.questions.kind).toBe("enum");
    expect(americanLitQuizPlugin.settings.questions.default).toBe("10");
    expect(americanLitQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof americanLitQuizPlugin.initialState).toBe("function");
    expect(typeof americanLitQuizPlugin.reducer).toBe("function");
    expect(typeof americanLitQuizPlugin.isTerminal).toBe("function");
    expect(typeof americanLitQuizPlugin.hint).toBe("function");
    expect(americanLitQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = americanLitQuizPlugin.initialState(42, S);
    const b = americanLitQuizPlugin.initialState(42, S);
    const c = americanLitQuizPlugin.initialState(43, S);
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
    expect(americanLitQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = americanLitQuizPlugin.initialState(7, S);
    const target = americanLitQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(americanLitQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(americanLitQuizPlugin.hint!(result)).toBeNull();
  });
});
