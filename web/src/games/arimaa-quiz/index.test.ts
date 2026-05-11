import { describe, it, expect } from "vitest";
import { arimaaQuizPlugin } from "./index.js";

describe("arimaaQuizPlugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(arimaaQuizPlugin.id).toBe("arimaa-quiz");
    expect(arimaaQuizPlugin.title).toBe("Arimaa Quiz");
    expect(arimaaQuizPlugin.category).toBe("board");
    expect(arimaaQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof arimaaQuizPlugin.initialState).toBe("function");
    expect(typeof arimaaQuizPlugin.reducer).toBe("function");
    expect(typeof arimaaQuizPlugin.isTerminal).toBe("function");
    expect(typeof arimaaQuizPlugin.hint).toBe("function");
    expect(arimaaQuizPlugin.component).toBeDefined();
    expect(arimaaQuizPlugin.settings.questions.default).toBe("10");
  });

  it("initialState is deterministic for a given seed and isTerminal returns null while playing", () => {
    const settings = { questions: "10" as const };
    const a = arimaaQuizPlugin.initialState(42, settings);
    const b = arimaaQuizPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.questions).toHaveLength(10);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(arimaaQuizPlugin.isTerminal!(a)).toBeNull();

    const different = arimaaQuizPlugin.initialState(7, settings);
    // Different seed should generally produce a different question ordering
    const sameOrder = a.questions.every((q, i) => q.question === different.questions[i]!.question);
    expect(sameOrder).toBe(false);
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const settings = { questions: "10" as const };
    const playing = arimaaQuizPlugin.initialState(1, settings);
    const hint = arimaaQuizPlugin.hint!(playing);
    expect(hint).not.toBeNull();
    expect(hint).toEqual({ selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 });

    const done = { ...playing, phase: "done" as const };
    expect(arimaaQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(arimaaQuizPlugin.hint!(result)).toBeNull();
    expect(arimaaQuizPlugin.isTerminal!(done)).toEqual({ score: playing.score });
  });
});
