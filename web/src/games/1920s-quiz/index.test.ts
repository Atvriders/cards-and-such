import { describe, it, expect } from "vitest";
import { nineteen20sQuizPlugin } from "./index.js";
import type { Nineteen20sQuizSettings } from "./state.js";

const S: Nineteen20sQuizSettings = { questions: "10" };

describe("nineteen20sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen20sQuizPlugin.id).toBe("1920s-quiz");
    expect(nineteen20sQuizPlugin.title).toBe("1920s Roaring Twenties Quiz");
    expect(nineteen20sQuizPlugin.category).toBe("board");
    expect(nineteen20sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen20sQuizPlugin.description).toBe("string");
    expect(nineteen20sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof nineteen20sQuizPlugin.howToPlay).toBe("string");
    expect(nineteen20sQuizPlugin.settings).toBeDefined();
    expect(nineteen20sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen20sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen20sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen20sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen20sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen20sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen20sQuizPlugin.hint).toBe("function");
    expect(nineteen20sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is false on a fresh state", () => {
    const a = nineteen20sQuizPlugin.initialState(42, S);
    const b = nineteen20sQuizPlugin.initialState(42, S);
    const c = nineteen20sQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(nineteen20sQuizPlugin.isTerminal(a)).toBeNull();

    // 15-question setting honors the question count cap
    const big = nineteen20sQuizPlugin.initialState(1, { questions: "15" });
    expect(big.questions.length).toBe(15);
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen20sQuizPlugin.initialState(7, S);
    const target = nineteen20sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(nineteen20sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen20sQuizPlugin.hint!(result)).toBeNull();
  });
});
