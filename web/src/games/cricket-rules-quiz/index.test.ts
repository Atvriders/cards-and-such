import { describe, it, expect } from "vitest";
import { cricketRulesQuizPlugin } from "./index.js";
import type { CricketRulesQuizSettings } from "./state.js";

const S: CricketRulesQuizSettings = { questions: "10" };

describe("cricketRulesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cricketRulesQuizPlugin.id).toBe("cricket-rules-quiz");
    expect(cricketRulesQuizPlugin.title).toBe("Cricket Rules Quiz");
    expect(cricketRulesQuizPlugin.category).toBe("board");
    expect(cricketRulesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cricketRulesQuizPlugin.description).toBe("string");
    expect(cricketRulesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(cricketRulesQuizPlugin.settings).toBeDefined();
    expect(cricketRulesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(cricketRulesQuizPlugin.settings.questions.default).toBe("10");
    expect(cricketRulesQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof cricketRulesQuizPlugin.initialState).toBe("function");
    expect(typeof cricketRulesQuizPlugin.reducer).toBe("function");
    expect(typeof cricketRulesQuizPlugin.isTerminal).toBe("function");
    expect(typeof cricketRulesQuizPlugin.hint).toBe("function");
    expect(cricketRulesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cricketRulesQuizPlugin.initialState(42, S);
    const b = cricketRulesQuizPlugin.initialState(42, S);
    const c = cricketRulesQuizPlugin.initialState(43, S);
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
    expect(cricketRulesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = cricketRulesQuizPlugin.initialState(7, S);
    const target = cricketRulesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" - hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(cricketRulesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(cricketRulesQuizPlugin.hint!(result)).toBeNull();
  });
});
