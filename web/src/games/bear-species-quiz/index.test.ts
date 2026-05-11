import { describe, it, expect } from "vitest";
import { bearSpeciesQuizPlugin } from "./index.js";
import type { BearSpeciesQuizSettings } from "./state.js";

const S: BearSpeciesQuizSettings = { questions: "10" };

describe("bearSpeciesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bearSpeciesQuizPlugin.id).toBe("bear-species-quiz");
    expect(bearSpeciesQuizPlugin.title).toBe("Bear Species Quiz");
    expect(bearSpeciesQuizPlugin.category).toBe("board");
    expect(bearSpeciesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bearSpeciesQuizPlugin.description).toBe("string");
    expect(bearSpeciesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(bearSpeciesQuizPlugin.settings).toBeDefined();
    expect(bearSpeciesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(bearSpeciesQuizPlugin.settings.questions.default).toBe("10");
    expect(bearSpeciesQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof bearSpeciesQuizPlugin.initialState).toBe("function");
    expect(typeof bearSpeciesQuizPlugin.reducer).toBe("function");
    expect(typeof bearSpeciesQuizPlugin.isTerminal).toBe("function");
    expect(typeof bearSpeciesQuizPlugin.hint).toBe("function");
    expect(bearSpeciesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bearSpeciesQuizPlugin.initialState(42, S);
    const b = bearSpeciesQuizPlugin.initialState(42, S);
    const c = bearSpeciesQuizPlugin.initialState(43, S);
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
    expect(bearSpeciesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bearSpeciesQuizPlugin.initialState(7, S);
    const target = bearSpeciesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(bearSpeciesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bearSpeciesQuizPlugin.hint!(result)).toBeNull();
  });
});
