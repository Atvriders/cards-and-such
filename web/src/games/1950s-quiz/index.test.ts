import { describe, it, expect } from "vitest";
import { nineteen50sQuizPlugin } from "./index.js";
import type { Nineteen50sQuizSettings } from "./state.js";

const S: Nineteen50sQuizSettings = { questions: "10" };

describe("nineteen50sQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(nineteen50sQuizPlugin.id).toBe("1950s-quiz");
    expect(nineteen50sQuizPlugin.title).toBe("1950s Post-War & Rock'n'Roll Quiz");
    expect(nineteen50sQuizPlugin.category).toBe("board");
    expect(nineteen50sQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nineteen50sQuizPlugin.description).toBe("string");
    expect(nineteen50sQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof nineteen50sQuizPlugin.howToPlay).toBe("string");
    expect(nineteen50sQuizPlugin.settings).toBeDefined();
    expect(nineteen50sQuizPlugin.settings.questions.kind).toBe("enum");
    expect(nineteen50sQuizPlugin.settings.questions.default).toBe("10");
    expect(nineteen50sQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof nineteen50sQuizPlugin.initialState).toBe("function");
    expect(typeof nineteen50sQuizPlugin.reducer).toBe("function");
    expect(typeof nineteen50sQuizPlugin.isTerminal).toBe("function");
    expect(typeof nineteen50sQuizPlugin.hint).toBe("function");
    expect(nineteen50sQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = nineteen50sQuizPlugin.initialState(42, S);
    const b = nineteen50sQuizPlugin.initialState(42, S);
    const c = nineteen50sQuizPlugin.initialState(43, S);
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
    expect(nineteen50sQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = nineteen50sQuizPlugin.initialState(7, S);
    const target = nineteen50sQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -- hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(nineteen50sQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(nineteen50sQuizPlugin.hint!(result)).toBeNull();
  });
});
