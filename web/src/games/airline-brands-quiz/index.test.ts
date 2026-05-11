import { describe, it, expect } from "vitest";
import { airlineBrandsQuizPlugin } from "./index.js";
import type { AirlineBrandsQuizSettings } from "./state.js";

const S: AirlineBrandsQuizSettings = { questions: "10" };

describe("airlineBrandsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(airlineBrandsQuizPlugin.id).toBe("airline-brands-quiz");
    expect(airlineBrandsQuizPlugin.title).toBe("Airline Brands Quiz");
    expect(airlineBrandsQuizPlugin.category).toBe("board");
    expect(airlineBrandsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof airlineBrandsQuizPlugin.description).toBe("string");
    expect(airlineBrandsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(airlineBrandsQuizPlugin.settings).toBeDefined();
    expect(airlineBrandsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(airlineBrandsQuizPlugin.settings.questions.default).toBe("10");
    expect(airlineBrandsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof airlineBrandsQuizPlugin.initialState).toBe("function");
    expect(typeof airlineBrandsQuizPlugin.reducer).toBe("function");
    expect(typeof airlineBrandsQuizPlugin.isTerminal).toBe("function");
    expect(typeof airlineBrandsQuizPlugin.hint).toBe("function");
    expect(airlineBrandsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = airlineBrandsQuizPlugin.initialState(42, S);
    const b = airlineBrandsQuizPlugin.initialState(42, S);
    const c = airlineBrandsQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text and same choice ordering
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(airlineBrandsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = airlineBrandsQuizPlugin.initialState(7, S);
    const target = airlineBrandsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(airlineBrandsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(airlineBrandsQuizPlugin.hint!(result)).toBeNull();
  });
});
