import { describe, it, expect } from "vitest";
import { darkChessQuizPlugin } from "./index.js";
import type { DarkChessQuizSettings, DarkChessQuizState } from "./state.js";

const S: DarkChessQuizSettings = { questions: "10" };

describe("darkChessQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(darkChessQuizPlugin.id).toBe("dark-chess-quiz");
    expect(darkChessQuizPlugin.title).toBe("Dark Chess Quiz");
    expect(darkChessQuizPlugin.category).toBe("board");
    expect(darkChessQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof darkChessQuizPlugin.description).toBe("string");
    expect(darkChessQuizPlugin.description.length).toBeGreaterThan(0);
    expect(darkChessQuizPlugin.settings).toBeDefined();
    expect(darkChessQuizPlugin.settings.questions.kind).toBe("enum");
    expect(darkChessQuizPlugin.settings.questions.default).toBe("10");
    expect(darkChessQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof darkChessQuizPlugin.initialState).toBe("function");
    expect(typeof darkChessQuizPlugin.reducer).toBe("function");
    expect(typeof darkChessQuizPlugin.isTerminal).toBe("function");
    expect(typeof darkChessQuizPlugin.hint).toBe("function");
    expect(darkChessQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = darkChessQuizPlugin.initialState(42, S);
    const b = darkChessQuizPlugin.initialState(42, S);
    const c = darkChessQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text and choices
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce different question ordering or shuffled choices
    const identical = a.questions.every(
      (q, i) =>
        q.question === c.questions[i]!.question &&
        q.choices.every((ch, j) => ch === c.questions[i]!.choices[j]),
    );
    expect(identical).toBe(false);
    // every chosen correct index must point to a real choice slot
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    expect(darkChessQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = darkChessQuizPlugin.initialState(7, S);
    const target = darkChessQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: DarkChessQuizState = { ...playing, phase: "done" };
    expect(darkChessQuizPlugin.hint!(done)).toBeNull();

    const result: DarkChessQuizState = { ...playing, phase: "result" };
    expect(darkChessQuizPlugin.hint!(result)).toBeNull();
  });
});
