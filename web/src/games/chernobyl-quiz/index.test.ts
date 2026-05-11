import { describe, it, expect } from "vitest";
import { chernobylQuizPlugin } from "./index.js";
import type { ChernobylQuizSettings } from "./state.js";

const S: ChernobylQuizSettings = { questions: "10" };

describe("chernobylQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chernobylQuizPlugin.id).toBe("chernobyl-quiz");
    expect(chernobylQuizPlugin.title).toBe("Chernobyl Quiz");
    expect(chernobylQuizPlugin.category).toBe("board");
    expect(chernobylQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chernobylQuizPlugin.description).toBe("string");
    expect(chernobylQuizPlugin.description.length).toBeGreaterThan(0);
    expect(chernobylQuizPlugin.settings).toBeDefined();
    expect(chernobylQuizPlugin.settings.questions.kind).toBe("enum");
    expect(chernobylQuizPlugin.settings.questions.default).toBe("10");
    expect(chernobylQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof chernobylQuizPlugin.initialState).toBe("function");
    expect(typeof chernobylQuizPlugin.reducer).toBe("function");
    expect(typeof chernobylQuizPlugin.isTerminal).toBe("function");
    expect(typeof chernobylQuizPlugin.hint).toBe("function");
    expect(chernobylQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chernobylQuizPlugin.initialState(42, S);
    const b = chernobylQuizPlugin.initialState(42, S);
    const c = chernobylQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text and same correct index
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(chernobylQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chernobylQuizPlugin.initialState(7, S);
    const target = chernobylQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(chernobylQuizPlugin.hint!(done)).toBeNull();
    expect(chernobylQuizPlugin.isTerminal(done)).toEqual({ score: done.score });

    const result = { ...playing, phase: "result" as const };
    expect(chernobylQuizPlugin.hint!(result)).toBeNull();
  });
});
