import { describe, it, expect } from "vitest";
import { antonymQuizPlugin } from "./index.js";
import type { AntonymQuizSettings } from "./state.js";

const S: AntonymQuizSettings = { questions: "8" };

describe("antonymQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(antonymQuizPlugin.id).toBe("antonym-quiz");
    expect(antonymQuizPlugin.title).toBe("Antonym Quiz");
    expect(antonymQuizPlugin.category).toBe("board");
    expect(antonymQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof antonymQuizPlugin.description).toBe("string");
    expect(antonymQuizPlugin.description.length).toBeGreaterThan(0);
    expect(antonymQuizPlugin.settings).toBeDefined();
    expect(antonymQuizPlugin.settings.questions.kind).toBe("enum");
    expect(antonymQuizPlugin.settings.questions.default).toBe("8");
    expect(antonymQuizPlugin.settings.questions.options).toEqual(["8", "12"]);
    expect(typeof antonymQuizPlugin.initialState).toBe("function");
    expect(typeof antonymQuizPlugin.reducer).toBe("function");
    expect(typeof antonymQuizPlugin.isTerminal).toBe("function");
    expect(typeof antonymQuizPlugin.hint).toBe("function");
    expect(antonymQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = antonymQuizPlugin.initialState(42, S);
    const b = antonymQuizPlugin.initialState(42, S);
    const c = antonymQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(8);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(antonymQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = antonymQuizPlugin.initialState(7, S);
    const target = antonymQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(antonymQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(antonymQuizPlugin.hint!(result)).toBeNull();
  });
});
