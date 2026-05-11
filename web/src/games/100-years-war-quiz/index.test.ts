import { describe, it, expect } from "vitest";
import { q100YearsWarQuizPlugin } from "./index.js";
import type { Q100YearsWarQuizSettings } from "./state.js";

const S: Q100YearsWarQuizSettings = { questions: "10" };

describe("q100YearsWarQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(q100YearsWarQuizPlugin.id).toBe("100-years-war-quiz");
    expect(q100YearsWarQuizPlugin.title).toBe("Hundred Years' War Quiz");
    expect(q100YearsWarQuizPlugin.category).toBe("board");
    expect(q100YearsWarQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof q100YearsWarQuizPlugin.description).toBe("string");
    expect(q100YearsWarQuizPlugin.description.length).toBeGreaterThan(0);
    expect(q100YearsWarQuizPlugin.settings).toBeDefined();
    expect(q100YearsWarQuizPlugin.settings.questions.kind).toBe("enum");
    expect(q100YearsWarQuizPlugin.settings.questions.default).toBe("10");
    expect(q100YearsWarQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof q100YearsWarQuizPlugin.initialState).toBe("function");
    expect(typeof q100YearsWarQuizPlugin.reducer).toBe("function");
    expect(typeof q100YearsWarQuizPlugin.isTerminal).toBe("function");
    expect(typeof q100YearsWarQuizPlugin.hint).toBe("function");
    expect(q100YearsWarQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is false on a fresh state", () => {
    const a = q100YearsWarQuizPlugin.initialState(42, S);
    const b = q100YearsWarQuizPlugin.initialState(42, S);
    const c = q100YearsWarQuizPlugin.initialState(43, S);
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
    expect(q100YearsWarQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = q100YearsWarQuizPlugin.initialState(7, S);
    const target = q100YearsWarQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(q100YearsWarQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(q100YearsWarQuizPlugin.hint!(result)).toBeNull();
  });
});
