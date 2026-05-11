import { describe, it, expect } from "vitest";
import { bonnieClydeQuizPlugin } from "./index.js";
import type { BonnieClydeQuizSettings } from "./state.js";

const S: BonnieClydeQuizSettings = { questions: "10" };

describe("bonnieClydeQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bonnieClydeQuizPlugin.id).toBe("bonnie-clyde-quiz");
    expect(bonnieClydeQuizPlugin.title).toBe("Bonnie & Clyde Quiz");
    expect(bonnieClydeQuizPlugin.category).toBe("board");
    expect(bonnieClydeQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bonnieClydeQuizPlugin.description).toBe("string");
    expect(bonnieClydeQuizPlugin.description.length).toBeGreaterThan(0);
    expect(bonnieClydeQuizPlugin.settings).toBeDefined();
    expect(bonnieClydeQuizPlugin.settings.questions.kind).toBe("enum");
    expect(bonnieClydeQuizPlugin.settings.questions.default).toBe("10");
    expect(bonnieClydeQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof bonnieClydeQuizPlugin.initialState).toBe("function");
    expect(typeof bonnieClydeQuizPlugin.reducer).toBe("function");
    expect(typeof bonnieClydeQuizPlugin.isTerminal).toBe("function");
    expect(typeof bonnieClydeQuizPlugin.hint).toBe("function");
    expect(bonnieClydeQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bonnieClydeQuizPlugin.initialState(42, S);
    const b = bonnieClydeQuizPlugin.initialState(42, S);
    const c = bonnieClydeQuizPlugin.initialState(43, S);
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
    expect(bonnieClydeQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bonnieClydeQuizPlugin.initialState(7, S);
    const target = bonnieClydeQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -- hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(bonnieClydeQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bonnieClydeQuizPlugin.hint!(result)).toBeNull();
  });
});
