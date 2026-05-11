import { describe, it, expect } from "vitest";
import { chuShogiBoardQuizPlugin } from "./index.js";
import type { ChuShogiBoardQuizSettings, ChuShogiBoardQuizState } from "./state.js";

const S: ChuShogiBoardQuizSettings = { questions: "10" };

describe("chuShogiBoardQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chuShogiBoardQuizPlugin.id).toBe("chu-shogi-board-quiz");
    expect(chuShogiBoardQuizPlugin.title).toBe("Chu Shogi Board Quiz");
    expect(chuShogiBoardQuizPlugin.category).toBe("board");
    expect(chuShogiBoardQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chuShogiBoardQuizPlugin.description).toBe("string");
    expect(chuShogiBoardQuizPlugin.description.length).toBeGreaterThan(0);
    expect(chuShogiBoardQuizPlugin.settings).toBeDefined();
    expect(chuShogiBoardQuizPlugin.settings.questions.kind).toBe("enum");
    expect(chuShogiBoardQuizPlugin.settings.questions.default).toBe("10");
    expect(chuShogiBoardQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof chuShogiBoardQuizPlugin.initialState).toBe("function");
    expect(typeof chuShogiBoardQuizPlugin.reducer).toBe("function");
    expect(typeof chuShogiBoardQuizPlugin.isTerminal).toBe("function");
    expect(typeof chuShogiBoardQuizPlugin.hint).toBe("function");
    expect(chuShogiBoardQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chuShogiBoardQuizPlugin.initialState(42, S);
    const b = chuShogiBoardQuizPlugin.initialState(42, S);
    const c = chuShogiBoardQuizPlugin.initialState(43, S);
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
    expect(chuShogiBoardQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chuShogiBoardQuizPlugin.initialState(7, S);
    const target = chuShogiBoardQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: ChuShogiBoardQuizState = { ...playing, phase: "done" };
    expect(chuShogiBoardQuizPlugin.hint!(done)).toBeNull();

    const result: ChuShogiBoardQuizState = { ...playing, phase: "result" };
    expect(chuShogiBoardQuizPlugin.hint!(result)).toBeNull();
  });
});
