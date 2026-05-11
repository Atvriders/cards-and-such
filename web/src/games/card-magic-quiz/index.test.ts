import { describe, it, expect } from "vitest";
import { cardMagicQuizPlugin } from "./index.js";
import type { CardMagicQuizSettings } from "./state.js";

const S: CardMagicQuizSettings = { questions: "10" };

describe("cardMagicQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardMagicQuizPlugin.id).toBe("card-magic-quiz");
    expect(cardMagicQuizPlugin.title).toBe("Card Magic Quiz");
    expect(cardMagicQuizPlugin.category).toBe("board");
    expect(cardMagicQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardMagicQuizPlugin.description).toBe("string");
    expect(cardMagicQuizPlugin.description.length).toBeGreaterThan(0);
    expect(cardMagicQuizPlugin.settings).toBeDefined();
    expect(cardMagicQuizPlugin.settings.questions.kind).toBe("enum");
    expect(cardMagicQuizPlugin.settings.questions.default).toBe("10");
    expect(cardMagicQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof cardMagicQuizPlugin.initialState).toBe("function");
    expect(typeof cardMagicQuizPlugin.reducer).toBe("function");
    expect(typeof cardMagicQuizPlugin.isTerminal).toBe("function");
    expect(typeof cardMagicQuizPlugin.hint).toBe("function");
    expect(cardMagicQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cardMagicQuizPlugin.initialState(42, S);
    const b = cardMagicQuizPlugin.initialState(42, S);
    const c = cardMagicQuizPlugin.initialState(43, S);
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
    expect(cardMagicQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = cardMagicQuizPlugin.initialState(7, S);
    const target = cardMagicQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(cardMagicQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(cardMagicQuizPlugin.hint!(result)).toBeNull();
  });
});
