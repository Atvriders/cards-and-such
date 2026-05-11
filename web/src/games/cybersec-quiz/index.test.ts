import { describe, it, expect } from "vitest";
import { cybersecQuizPlugin } from "./index.js";
import type { CybersecQuizSettings } from "./state.js";

const S: CybersecQuizSettings = { questions: "10" };

describe("cybersecQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cybersecQuizPlugin.id).toBe("cybersec-quiz");
    expect(cybersecQuizPlugin.title).toBe("Cybersecurity Quiz");
    expect(cybersecQuizPlugin.category).toBe("board");
    expect(cybersecQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cybersecQuizPlugin.description).toBe("string");
    expect(cybersecQuizPlugin.description.length).toBeGreaterThan(0);
    expect(cybersecQuizPlugin.settings).toBeDefined();
    expect(cybersecQuizPlugin.settings.questions.kind).toBe("enum");
    expect(cybersecQuizPlugin.settings.questions.default).toBe("10");
    expect(cybersecQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof cybersecQuizPlugin.initialState).toBe("function");
    expect(typeof cybersecQuizPlugin.reducer).toBe("function");
    expect(typeof cybersecQuizPlugin.isTerminal).toBe("function");
    expect(typeof cybersecQuizPlugin.hint).toBe("function");
    expect(cybersecQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cybersecQuizPlugin.initialState(42, S);
    const b = cybersecQuizPlugin.initialState(42, S);
    const c = cybersecQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
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
    expect(cybersecQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = cybersecQuizPlugin.initialState(7, S);
    const target = cybersecQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(cybersecQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(cybersecQuizPlugin.hint!(result)).toBeNull();
  });
});
