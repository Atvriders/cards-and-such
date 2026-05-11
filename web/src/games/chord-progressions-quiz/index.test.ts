import { describe, it, expect } from "vitest";
import { chordProgressionsQuizPlugin } from "./index.js";
import type { ChordProgressionsQuizSettings } from "./state.js";

const S: ChordProgressionsQuizSettings = { questions: "10" };

describe("chordProgressionsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chordProgressionsQuizPlugin.id).toBe("chord-progressions-quiz");
    expect(chordProgressionsQuizPlugin.title).toBe("Chord Progressions Quiz");
    expect(chordProgressionsQuizPlugin.category).toBe("board");
    expect(chordProgressionsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chordProgressionsQuizPlugin.description).toBe("string");
    expect(chordProgressionsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(chordProgressionsQuizPlugin.settings).toBeDefined();
    expect(chordProgressionsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(chordProgressionsQuizPlugin.settings.questions.default).toBe("10");
    expect(chordProgressionsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof chordProgressionsQuizPlugin.initialState).toBe("function");
    expect(typeof chordProgressionsQuizPlugin.reducer).toBe("function");
    expect(typeof chordProgressionsQuizPlugin.isTerminal).toBe("function");
    expect(typeof chordProgressionsQuizPlugin.hint).toBe("function");
    expect(chordProgressionsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chordProgressionsQuizPlugin.initialState(42, S);
    const b = chordProgressionsQuizPlugin.initialState(42, S);
    const c = chordProgressionsQuizPlugin.initialState(43, S);
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
    // each question's correct index points to a valid choice slot
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(chordProgressionsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chordProgressionsQuizPlugin.initialState(7, S);
    const target = chordProgressionsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(chordProgressionsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(chordProgressionsQuizPlugin.hint!(result)).toBeNull();
  });
});
