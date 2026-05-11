import { describe, it, expect } from "vitest";
import { britishComedyQuizPlugin } from "./index.js";
import type { BritishComedyQuizSettings } from "./state.js";

const S: BritishComedyQuizSettings = { questions: "10" };

describe("britishComedyQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(britishComedyQuizPlugin.id).toBe("british-comedy-quiz");
    expect(britishComedyQuizPlugin.title).toBe("British Comedy Classics Quiz");
    expect(britishComedyQuizPlugin.category).toBe("board");
    expect(britishComedyQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof britishComedyQuizPlugin.description).toBe("string");
    expect(britishComedyQuizPlugin.description.length).toBeGreaterThan(0);
    expect(britishComedyQuizPlugin.settings).toBeDefined();
    expect(britishComedyQuizPlugin.settings.questions.kind).toBe("enum");
    expect(britishComedyQuizPlugin.settings.questions.default).toBe("10");
    expect(britishComedyQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof britishComedyQuizPlugin.initialState).toBe("function");
    expect(typeof britishComedyQuizPlugin.reducer).toBe("function");
    expect(typeof britishComedyQuizPlugin.isTerminal).toBe("function");
    expect(typeof britishComedyQuizPlugin.hint).toBe("function");
    expect(britishComedyQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = britishComedyQuizPlugin.initialState(42, S);
    const b = britishComedyQuizPlugin.initialState(42, S);
    const c = britishComedyQuizPlugin.initialState(43, S);
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
    expect(britishComedyQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = britishComedyQuizPlugin.initialState(7, S);
    const target = britishComedyQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(britishComedyQuizPlugin.hint!(done)).toBeNull();
    expect(britishComedyQuizPlugin.isTerminal(done)).toEqual({ score: done.score });

    const result = { ...playing, phase: "result" as const };
    expect(britishComedyQuizPlugin.hint!(result)).toBeNull();
  });
});
