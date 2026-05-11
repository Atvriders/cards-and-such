import { describe, it, expect } from "vitest";
import { baoMancalaQuizPlugin } from "./index.js";
import type { BaoMancalaQuizSettings, BaoMancalaQuizState } from "./state.js";

const S: BaoMancalaQuizSettings = { questions: "10" };

describe("baoMancalaQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(baoMancalaQuizPlugin.id).toBe("bao-mancala-quiz");
    expect(baoMancalaQuizPlugin.title).toBe("Bao Mancala Quiz");
    expect(baoMancalaQuizPlugin.category).toBe("board");
    expect(baoMancalaQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof baoMancalaQuizPlugin.description).toBe("string");
    expect(baoMancalaQuizPlugin.description.length).toBeGreaterThan(0);
    expect(baoMancalaQuizPlugin.settings).toBeDefined();
    expect(baoMancalaQuizPlugin.settings.questions.kind).toBe("enum");
    expect(baoMancalaQuizPlugin.settings.questions.default).toBe("10");
    expect(baoMancalaQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof baoMancalaQuizPlugin.initialState).toBe("function");
    expect(typeof baoMancalaQuizPlugin.reducer).toBe("function");
    expect(typeof baoMancalaQuizPlugin.isTerminal).toBe("function");
    expect(typeof baoMancalaQuizPlugin.hint).toBe("function");
    expect(baoMancalaQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = baoMancalaQuizPlugin.initialState(42, S);
    const b = baoMancalaQuizPlugin.initialState(42, S);
    const c = baoMancalaQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text, choices, correct index
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering of questions or choices
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
    expect(baoMancalaQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = baoMancalaQuizPlugin.initialState(7, S);
    const target = baoMancalaQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: BaoMancalaQuizState = { ...playing, phase: "done" };
    expect(baoMancalaQuizPlugin.hint!(done)).toBeNull();

    const result: BaoMancalaQuizState = { ...playing, phase: "result" };
    expect(baoMancalaQuizPlugin.hint!(result)).toBeNull();
  });
});
