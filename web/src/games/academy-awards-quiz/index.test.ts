import { describe, it, expect } from "vitest";
import { academyAwardsQuizPlugin } from "./index.js";
import type { AcademyAwardsQuizSettings } from "./state.js";

const S: AcademyAwardsQuizSettings = { questions: "10" };

describe("academyAwardsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(academyAwardsQuizPlugin.id).toBe("academy-awards-quiz");
    expect(academyAwardsQuizPlugin.title).toBe("Academy Awards Quiz");
    expect(academyAwardsQuizPlugin.category).toBe("board");
    expect(academyAwardsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof academyAwardsQuizPlugin.description).toBe("string");
    expect(academyAwardsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(academyAwardsQuizPlugin.settings).toBeDefined();
    expect(academyAwardsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(academyAwardsQuizPlugin.settings.questions.default).toBe("10");
    expect(academyAwardsQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof academyAwardsQuizPlugin.initialState).toBe("function");
    expect(typeof academyAwardsQuizPlugin.reducer).toBe("function");
    expect(typeof academyAwardsQuizPlugin.isTerminal).toBe("function");
    expect(typeof academyAwardsQuizPlugin.hint).toBe("function");
    expect(academyAwardsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = academyAwardsQuizPlugin.initialState(42, S);
    const b = academyAwardsQuizPlugin.initialState(42, S);
    const c = academyAwardsQuizPlugin.initialState(43, S);
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
    expect(academyAwardsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = academyAwardsQuizPlugin.initialState(7, S);
    const target = academyAwardsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(academyAwardsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(academyAwardsQuizPlugin.hint!(result)).toBeNull();
  });
});
