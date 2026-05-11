import { describe, it, expect } from "vitest";
import { basketballRulesQuizPlugin } from "./index.js";
import type { BasketballRulesQuizSettings } from "./state.js";

const S: BasketballRulesQuizSettings = { questions: "10" };

describe("basketballRulesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(basketballRulesQuizPlugin.id).toBe("basketball-rules-quiz");
    expect(basketballRulesQuizPlugin.title).toBe("Basketball Rules Quiz");
    expect(basketballRulesQuizPlugin.category).toBe("board");
    expect(basketballRulesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof basketballRulesQuizPlugin.description).toBe("string");
    expect(basketballRulesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(basketballRulesQuizPlugin.settings).toBeDefined();
    expect(basketballRulesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(basketballRulesQuizPlugin.settings.questions.default).toBe("10");
    expect(basketballRulesQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof basketballRulesQuizPlugin.initialState).toBe("function");
    expect(typeof basketballRulesQuizPlugin.reducer).toBe("function");
    expect(typeof basketballRulesQuizPlugin.isTerminal).toBe("function");
    expect(typeof basketballRulesQuizPlugin.hint).toBe("function");
    expect(basketballRulesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = basketballRulesQuizPlugin.initialState(42, S);
    const b = basketballRulesQuizPlugin.initialState(42, S);
    const c = basketballRulesQuizPlugin.initialState(43, S);
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
    expect(basketballRulesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = basketballRulesQuizPlugin.initialState(7, S);
    const target = basketballRulesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(basketballRulesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(basketballRulesQuizPlugin.hint!(result)).toBeNull();
  });
});
