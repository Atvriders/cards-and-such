import { describe, it, expect } from "vitest";
import { colosseumQuizPlugin } from "./index.js";
import type { ColosseumQuizSettings } from "./state.js";

const S: ColosseumQuizSettings = { questions: "10" };

describe("colosseumQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(colosseumQuizPlugin.id).toBe("colosseum-quiz");
    expect(colosseumQuizPlugin.title).toBe("Colosseum Quiz");
    expect(colosseumQuizPlugin.category).toBe("board");
    expect(colosseumQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof colosseumQuizPlugin.description).toBe("string");
    expect(colosseumQuizPlugin.description.length).toBeGreaterThan(0);
    expect(colosseumQuizPlugin.settings).toBeDefined();
    expect(colosseumQuizPlugin.settings.questions.kind).toBe("enum");
    expect(colosseumQuizPlugin.settings.questions.default).toBe("10");
    expect(colosseumQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof colosseumQuizPlugin.initialState).toBe("function");
    expect(typeof colosseumQuizPlugin.reducer).toBe("function");
    expect(typeof colosseumQuizPlugin.isTerminal).toBe("function");
    expect(typeof colosseumQuizPlugin.hint).toBe("function");
    expect(colosseumQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = colosseumQuizPlugin.initialState(42, S);
    const b = colosseumQuizPlugin.initialState(42, S);
    const c = colosseumQuizPlugin.initialState(43, S);
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
    expect(colosseumQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = colosseumQuizPlugin.initialState(7, S);
    const target = colosseumQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -- hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(colosseumQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(colosseumQuizPlugin.hint!(result)).toBeNull();
  });
});
