import { describe, it, expect } from "vitest";
import { ceeLoQuizPlugin } from "./index.js";
import type { CeeLoQuizSettings } from "./state.js";

const S: CeeLoQuizSettings = { questions: "10" };

describe("ceeLoQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(ceeLoQuizPlugin.id).toBe("cee-lo-quiz");
    expect(ceeLoQuizPlugin.title).toBe("Cee-Lo Dice Quiz");
    expect(ceeLoQuizPlugin.category).toBe("board");
    expect(ceeLoQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof ceeLoQuizPlugin.description).toBe("string");
    expect(ceeLoQuizPlugin.description.length).toBeGreaterThan(0);
    expect(ceeLoQuizPlugin.settings).toBeDefined();
    expect(ceeLoQuizPlugin.settings.questions.kind).toBe("enum");
    expect(ceeLoQuizPlugin.settings.questions.default).toBe("10");
    expect(ceeLoQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof ceeLoQuizPlugin.initialState).toBe("function");
    expect(typeof ceeLoQuizPlugin.reducer).toBe("function");
    expect(typeof ceeLoQuizPlugin.isTerminal).toBe("function");
    expect(typeof ceeLoQuizPlugin.hint).toBe("function");
    expect(ceeLoQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = ceeLoQuizPlugin.initialState(42, S);
    const b = ceeLoQuizPlugin.initialState(42, S);
    const c = ceeLoQuizPlugin.initialState(43, S);
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
    expect(ceeLoQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = ceeLoQuizPlugin.initialState(7, S);
    const target = ceeLoQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(ceeLoQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(ceeLoQuizPlugin.hint!(result)).toBeNull();
  });
});
