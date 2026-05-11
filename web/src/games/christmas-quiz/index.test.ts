import { describe, it, expect } from "vitest";
import { christmasQuizPlugin } from "./index.js";
import type { ChristmasQuizSettings } from "./state.js";

const S: ChristmasQuizSettings = { questions: "10" };

describe("christmasQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(christmasQuizPlugin.id).toBe("christmas-quiz");
    expect(christmasQuizPlugin.title).toBe("Christmas Quiz");
    expect(christmasQuizPlugin.category).toBe("board");
    expect(christmasQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof christmasQuizPlugin.description).toBe("string");
    expect(christmasQuizPlugin.description.length).toBeGreaterThan(0);
    expect(christmasQuizPlugin.settings).toBeDefined();
    expect(christmasQuizPlugin.settings.questions.kind).toBe("enum");
    expect(christmasQuizPlugin.settings.questions.default).toBe("10");
    expect(christmasQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof christmasQuizPlugin.initialState).toBe("function");
    expect(typeof christmasQuizPlugin.reducer).toBe("function");
    expect(typeof christmasQuizPlugin.isTerminal).toBe("function");
    expect(typeof christmasQuizPlugin.hint).toBe("function");
    expect(christmasQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = christmasQuizPlugin.initialState(42, S);
    const b = christmasQuizPlugin.initialState(42, S);
    const c = christmasQuizPlugin.initialState(43, S);
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
    expect(christmasQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = christmasQuizPlugin.initialState(7, S);
    const target = christmasQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(christmasQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(christmasQuizPlugin.hint!(result)).toBeNull();
  });
});
