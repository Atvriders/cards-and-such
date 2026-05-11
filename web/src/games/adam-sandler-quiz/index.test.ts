import { describe, it, expect } from "vitest";
import { adamSandlerQuizPlugin } from "./index.js";
import type { AdamSandlerQuizSettings } from "./state.js";

const S: AdamSandlerQuizSettings = { questions: "10" };

describe("adamSandlerQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(adamSandlerQuizPlugin.id).toBe("adam-sandler-quiz");
    expect(adamSandlerQuizPlugin.title).toBe("Adam Sandler Films Quiz");
    expect(adamSandlerQuizPlugin.category).toBe("board");
    expect(adamSandlerQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof adamSandlerQuizPlugin.description).toBe("string");
    expect(adamSandlerQuizPlugin.description.length).toBeGreaterThan(0);
    expect(adamSandlerQuizPlugin.settings).toBeDefined();
    expect(adamSandlerQuizPlugin.settings.questions.kind).toBe("enum");
    expect(adamSandlerQuizPlugin.settings.questions.default).toBe("10");
    expect(adamSandlerQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof adamSandlerQuizPlugin.initialState).toBe("function");
    expect(typeof adamSandlerQuizPlugin.reducer).toBe("function");
    expect(typeof adamSandlerQuizPlugin.isTerminal).toBe("function");
    expect(typeof adamSandlerQuizPlugin.hint).toBe("function");
    expect(adamSandlerQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = adamSandlerQuizPlugin.initialState(42, S);
    const b = adamSandlerQuizPlugin.initialState(42, S);
    const c = adamSandlerQuizPlugin.initialState(43, S);
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
    expect(adamSandlerQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = adamSandlerQuizPlugin.initialState(7, S);
    const target = adamSandlerQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(adamSandlerQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(adamSandlerQuizPlugin.hint!(result)).toBeNull();
  });
});
