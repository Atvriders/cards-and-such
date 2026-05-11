import { describe, it, expect } from "vitest";
import { abandonArtichokesQuizPlugin } from "./index.js";
import type { AbandonArtichokesQuizSettings } from "./state.js";

const S: AbandonArtichokesQuizSettings = { questions: "10" };

describe("abandonArtichokesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(abandonArtichokesQuizPlugin.id).toBe("abandon-artichokes-quiz");
    expect(abandonArtichokesQuizPlugin.title).toBe("Abandon Artichokes Trivia");
    expect(abandonArtichokesQuizPlugin.category).toBe("board");
    expect(abandonArtichokesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof abandonArtichokesQuizPlugin.description).toBe("string");
    expect(abandonArtichokesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof abandonArtichokesQuizPlugin.howToPlay).toBe("string");
    expect(abandonArtichokesQuizPlugin.settings).toBeDefined();
    expect(abandonArtichokesQuizPlugin.settings.questions.kind).toBe("enum");
    expect(abandonArtichokesQuizPlugin.settings.questions.default).toBe("10");
    expect(abandonArtichokesQuizPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof abandonArtichokesQuizPlugin.initialState).toBe("function");
    expect(typeof abandonArtichokesQuizPlugin.reducer).toBe("function");
    expect(typeof abandonArtichokesQuizPlugin.isTerminal).toBe("function");
    expect(typeof abandonArtichokesQuizPlugin.hint).toBe("function");
    expect(abandonArtichokesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = abandonArtichokesQuizPlugin.initialState(42, S);
    const b = abandonArtichokesQuizPlugin.initialState(42, S);
    const c = abandonArtichokesQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering of choices or questions
    const sameOrder = a.questions.every((q, i) =>
      q.question === c.questions[i]!.question && q.correct === c.questions[i]!.correct,
    );
    expect(sameOrder).toBe(false);
    expect(abandonArtichokesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = abandonArtichokesQuizPlugin.initialState(7, S);
    const target = abandonArtichokesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(abandonArtichokesQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(abandonArtichokesQuizPlugin.hint!(result)).toBeNull();
  });
});
