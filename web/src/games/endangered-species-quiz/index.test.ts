import { describe, it, expect } from "vitest";
import { endangeredSpeciesQuizPlugin } from "./index.js";
import type { EndangeredSpeciesQuizSettings } from "./state.js";

const S: EndangeredSpeciesQuizSettings = { questions: "10" };

describe("endangeredSpeciesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(endangeredSpeciesQuizPlugin.id).toBe("endangered-species-quiz");
    expect(endangeredSpeciesQuizPlugin.title).toBe("Endangered Species Quiz");
    expect(endangeredSpeciesQuizPlugin.category).toBe("board");
    expect(endangeredSpeciesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof endangeredSpeciesQuizPlugin.description).toBe("string");
    expect(endangeredSpeciesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(endangeredSpeciesQuizPlugin.settings).toBeDefined();
    expect(endangeredSpeciesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(endangeredSpeciesQuizPlugin.settings.questions.default).toBe("10");
    expect(endangeredSpeciesQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof endangeredSpeciesQuizPlugin.initialState).toBe("function");
    expect(typeof endangeredSpeciesQuizPlugin.reducer).toBe("function");
    expect(typeof endangeredSpeciesQuizPlugin.isTerminal).toBe("function");
    expect(typeof endangeredSpeciesQuizPlugin.hint).toBe("function");
    expect(endangeredSpeciesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is false on a fresh state", () => {
    const a = endangeredSpeciesQuizPlugin.initialState(42, S);
    const b = endangeredSpeciesQuizPlugin.initialState(42, S);
    const c = endangeredSpeciesQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(endangeredSpeciesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = endangeredSpeciesQuizPlugin.initialState(7, S);
    const target = endangeredSpeciesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(endangeredSpeciesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(endangeredSpeciesQuizPlugin.hint!(result)).toBeNull();
  });
});
