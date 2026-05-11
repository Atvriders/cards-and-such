import { describe, it, expect } from "vitest";
import { dessertQuizPlugin } from "./index.js";
import type { DessertQuizSettings } from "./state.js";

const S: DessertQuizSettings = { questions: "10" };

describe("dessertQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(dessertQuizPlugin.id).toBe("dessert-quiz");
    expect(dessertQuizPlugin.title).toBe("Desserts Quiz");
    expect(dessertQuizPlugin.category).toBe("board");
    expect(dessertQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dessertQuizPlugin.description).toBe("string");
    expect(dessertQuizPlugin.description.length).toBeGreaterThan(0);
    expect(dessertQuizPlugin.settings).toBeDefined();
    expect(dessertQuizPlugin.settings.questions.kind).toBe("enum");
    expect(dessertQuizPlugin.settings.questions.default).toBe("10");
    expect(dessertQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof dessertQuizPlugin.initialState).toBe("function");
    expect(typeof dessertQuizPlugin.reducer).toBe("function");
    expect(typeof dessertQuizPlugin.isTerminal).toBe("function");
    expect(typeof dessertQuizPlugin.hint).toBe("function");
    expect(dessertQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = dessertQuizPlugin.initialState(42, S);
    const b = dessertQuizPlugin.initialState(42, S);
    const c = dessertQuizPlugin.initialState(43, S);
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
    expect(dessertQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = dessertQuizPlugin.initialState(7, S);
    const target = dessertQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(dessertQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(dessertQuizPlugin.hint!(result)).toBeNull();
  });
});
