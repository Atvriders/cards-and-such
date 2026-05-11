import { describe, it, expect } from "vitest";
import { bluesQuizPlugin } from "./index.js";
import type { BluesQuizSettings } from "./state.js";

const S: BluesQuizSettings = { questions: "10" };

describe("bluesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bluesQuizPlugin.id).toBe("blues-quiz");
    expect(bluesQuizPlugin.title).toBe("Blues Music Quiz");
    expect(bluesQuizPlugin.category).toBe("board");
    expect(bluesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bluesQuizPlugin.description).toBe("string");
    expect(bluesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(bluesQuizPlugin.settings).toBeDefined();
    expect(bluesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(bluesQuizPlugin.settings.questions.default).toBe("10");
    expect(bluesQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof bluesQuizPlugin.initialState).toBe("function");
    expect(typeof bluesQuizPlugin.reducer).toBe("function");
    expect(typeof bluesQuizPlugin.isTerminal).toBe("function");
    expect(typeof bluesQuizPlugin.hint).toBe("function");
    expect(bluesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bluesQuizPlugin.initialState(42, S);
    const b = bluesQuizPlugin.initialState(42, S);
    const c = bluesQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical question ordering
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions.map((q) => q.question)).toEqual(a.questions.map((q) => q.question));
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(bluesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bluesQuizPlugin.initialState(7, S);
    const target = bluesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(bluesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bluesQuizPlugin.hint!(result)).toBeNull();
  });
});
