import { describe, it, expect } from "vitest";
import { coffeeBrewingQuizPlugin } from "./index.js";
import type { CoffeeBrewingQuizSettings } from "./state.js";

const S: CoffeeBrewingQuizSettings = { questions: "10" };

describe("coffeeBrewingQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(coffeeBrewingQuizPlugin.id).toBe("coffee-brewing-quiz");
    expect(coffeeBrewingQuizPlugin.title).toBe("Coffee Brewing Quiz");
    expect(coffeeBrewingQuizPlugin.category).toBe("board");
    expect(coffeeBrewingQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coffeeBrewingQuizPlugin.description).toBe("string");
    expect(coffeeBrewingQuizPlugin.description.length).toBeGreaterThan(0);
    expect(coffeeBrewingQuizPlugin.settings).toBeDefined();
    expect(coffeeBrewingQuizPlugin.settings.questions.kind).toBe("enum");
    expect(coffeeBrewingQuizPlugin.settings.questions.default).toBe("10");
    expect(coffeeBrewingQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof coffeeBrewingQuizPlugin.initialState).toBe("function");
    expect(typeof coffeeBrewingQuizPlugin.reducer).toBe("function");
    expect(typeof coffeeBrewingQuizPlugin.isTerminal).toBe("function");
    expect(typeof coffeeBrewingQuizPlugin.hint).toBe("function");
    expect(coffeeBrewingQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = coffeeBrewingQuizPlugin.initialState(42, S);
    const b = coffeeBrewingQuizPlugin.initialState(42, S);
    const c = coffeeBrewingQuizPlugin.initialState(43, S);
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
    expect(coffeeBrewingQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = coffeeBrewingQuizPlugin.initialState(7, S);
    const target = coffeeBrewingQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(coffeeBrewingQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(coffeeBrewingQuizPlugin.hint!(result)).toBeNull();
  });
});
