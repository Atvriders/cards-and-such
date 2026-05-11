import { describe, it, expect } from "vitest";
import { balletQuizPlugin } from "./index.js";
import type { BalletQuizSettings } from "./state.js";

const S: BalletQuizSettings = { questions: "10" };

describe("balletQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(balletQuizPlugin.id).toBe("ballet-quiz");
    expect(balletQuizPlugin.title).toBe("Ballet Quiz");
    expect(balletQuizPlugin.category).toBe("board");
    expect(balletQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof balletQuizPlugin.description).toBe("string");
    expect(balletQuizPlugin.description.length).toBeGreaterThan(0);
    expect(balletQuizPlugin.settings).toBeDefined();
    expect(balletQuizPlugin.settings.questions.kind).toBe("enum");
    expect(balletQuizPlugin.settings.questions.default).toBe("10");
    expect(balletQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof balletQuizPlugin.initialState).toBe("function");
    expect(typeof balletQuizPlugin.reducer).toBe("function");
    expect(typeof balletQuizPlugin.isTerminal).toBe("function");
    expect(typeof balletQuizPlugin.hint).toBe("function");
    expect(balletQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = balletQuizPlugin.initialState(42, S);
    const b = balletQuizPlugin.initialState(42, S);
    const c = balletQuizPlugin.initialState(43, S);
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
    expect(balletQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = balletQuizPlugin.initialState(7, S);
    const target = balletQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(balletQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(balletQuizPlugin.hint!(result)).toBeNull();
  });
});
