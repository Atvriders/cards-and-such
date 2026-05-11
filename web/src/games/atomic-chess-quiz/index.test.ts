import { describe, it, expect } from "vitest";
import { atomicChessQuizPlugin } from "./index.js";
import type { AtomicChessQuizSettings } from "./state.js";

const S: AtomicChessQuizSettings = { questions: "10" };

describe("atomicChessQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(atomicChessQuizPlugin.id).toBe("atomic-chess-quiz");
    expect(atomicChessQuizPlugin.title).toBe("Atomic Chess Quiz");
    expect(atomicChessQuizPlugin.category).toBe("board");
    expect(atomicChessQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof atomicChessQuizPlugin.description).toBe("string");
    expect(atomicChessQuizPlugin.description.length).toBeGreaterThan(0);
    expect(atomicChessQuizPlugin.settings).toBeDefined();
    expect(atomicChessQuizPlugin.settings.questions.kind).toBe("enum");
    expect(atomicChessQuizPlugin.settings.questions.default).toBe("10");
    expect(atomicChessQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof atomicChessQuizPlugin.initialState).toBe("function");
    expect(typeof atomicChessQuizPlugin.reducer).toBe("function");
    expect(typeof atomicChessQuizPlugin.isTerminal).toBe("function");
    expect(typeof atomicChessQuizPlugin.hint).toBe("function");
    expect(atomicChessQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = atomicChessQuizPlugin.initialState(42, S);
    const b = atomicChessQuizPlugin.initialState(42, S);
    const c = atomicChessQuizPlugin.initialState(43, S);
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
    expect(atomicChessQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = atomicChessQuizPlugin.initialState(7, S);
    const target = atomicChessQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(atomicChessQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(atomicChessQuizPlugin.hint!(result)).toBeNull();
  });
});
