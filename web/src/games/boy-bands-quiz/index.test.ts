import { describe, it, expect } from "vitest";
import { boyBandsQuizPlugin } from "./index.js";
import type { BoyBandsQuizSettings } from "./state.js";

const S: BoyBandsQuizSettings = { questions: "10" };

describe("boyBandsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(boyBandsQuizPlugin.id).toBe("boy-bands-quiz");
    expect(boyBandsQuizPlugin.title).toBe("Boy Bands Quiz");
    expect(boyBandsQuizPlugin.category).toBe("board");
    expect(boyBandsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof boyBandsQuizPlugin.description).toBe("string");
    expect(boyBandsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(boyBandsQuizPlugin.settings).toBeDefined();
    expect(boyBandsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(boyBandsQuizPlugin.settings.questions.default).toBe("10");
    expect(boyBandsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof boyBandsQuizPlugin.initialState).toBe("function");
    expect(typeof boyBandsQuizPlugin.reducer).toBe("function");
    expect(typeof boyBandsQuizPlugin.isTerminal).toBe("function");
    expect(typeof boyBandsQuizPlugin.hint).toBe("function");
    expect(boyBandsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = boyBandsQuizPlugin.initialState(42, S);
    const b = boyBandsQuizPlugin.initialState(42, S);
    const c = boyBandsQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(boyBandsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = boyBandsQuizPlugin.initialState(7, S);
    const target = boyBandsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(boyBandsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(boyBandsQuizPlugin.hint!(result)).toBeNull();
  });
});
