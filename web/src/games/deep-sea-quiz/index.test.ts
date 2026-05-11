import { describe, it, expect } from "vitest";
import { deepSeaQuizPlugin } from "./index.js";
import type { DeepSeaQuizSettings } from "./state.js";

const S: DeepSeaQuizSettings = { questions: "10" };

describe("deepSeaQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(deepSeaQuizPlugin.id).toBe("deep-sea-quiz");
    expect(deepSeaQuizPlugin.title).toBe("Deep Sea Quiz");
    expect(deepSeaQuizPlugin.category).toBe("board");
    expect(deepSeaQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof deepSeaQuizPlugin.description).toBe("string");
    expect(deepSeaQuizPlugin.description.length).toBeGreaterThan(0);
    expect(deepSeaQuizPlugin.settings).toBeDefined();
    expect(deepSeaQuizPlugin.settings.questions.kind).toBe("enum");
    expect(deepSeaQuizPlugin.settings.questions.default).toBe("10");
    expect(deepSeaQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof deepSeaQuizPlugin.initialState).toBe("function");
    expect(typeof deepSeaQuizPlugin.reducer).toBe("function");
    expect(typeof deepSeaQuizPlugin.isTerminal).toBe("function");
    expect(typeof deepSeaQuizPlugin.hint).toBe("function");
    expect(deepSeaQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = deepSeaQuizPlugin.initialState(42, S);
    const b = deepSeaQuizPlugin.initialState(42, S);
    const c = deepSeaQuizPlugin.initialState(43, S);
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
    expect(deepSeaQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = deepSeaQuizPlugin.initialState(7, S);
    const target = deepSeaQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(deepSeaQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(deepSeaQuizPlugin.hint!(result)).toBeNull();
  });
});
