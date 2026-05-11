import { describe, it, expect } from "vitest";
import { capablancaChessQuizPlugin } from "./index.js";
import type { CapablancaChessQuizSettings, CapablancaChessQuizState } from "./state.js";

const S: CapablancaChessQuizSettings = { questions: "10" };

describe("capablancaChessQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(capablancaChessQuizPlugin.id).toBe("capablanca-chess-quiz");
    expect(capablancaChessQuizPlugin.title).toBe("Capablanca Chess Quiz");
    expect(capablancaChessQuizPlugin.category).toBe("board");
    expect(capablancaChessQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof capablancaChessQuizPlugin.description).toBe("string");
    expect(capablancaChessQuizPlugin.description.length).toBeGreaterThan(0);
    expect(capablancaChessQuizPlugin.settings).toBeDefined();
    expect(capablancaChessQuizPlugin.settings.questions.kind).toBe("enum");
    expect(capablancaChessQuizPlugin.settings.questions.default).toBe("10");
    expect(capablancaChessQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof capablancaChessQuizPlugin.initialState).toBe("function");
    expect(typeof capablancaChessQuizPlugin.reducer).toBe("function");
    expect(typeof capablancaChessQuizPlugin.isTerminal).toBe("function");
    expect(typeof capablancaChessQuizPlugin.hint).toBe("function");
    expect(capablancaChessQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = capablancaChessQuizPlugin.initialState(42, S);
    const b = capablancaChessQuizPlugin.initialState(42, S);
    const c = capablancaChessQuizPlugin.initialState(43, S);
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
    expect(capablancaChessQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = capablancaChessQuizPlugin.initialState(7, S);
    const target = capablancaChessQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: CapablancaChessQuizState = { ...playing, phase: "done" };
    expect(capablancaChessQuizPlugin.hint!(done)).toBeNull();

    const result: CapablancaChessQuizState = { ...playing, phase: "result" };
    expect(capablancaChessQuizPlugin.hint!(result)).toBeNull();
  });
});
