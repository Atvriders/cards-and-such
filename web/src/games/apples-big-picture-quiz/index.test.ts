import { describe, it, expect } from "vitest";
import { applesBigPictureQuizPlugin } from "./index.js";
import { TOTAL_QUESTIONS, type ApplesBigPictureQuizSettings } from "./state.js";

const S: ApplesBigPictureQuizSettings = { dummy: false };

describe("applesBigPictureQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(applesBigPictureQuizPlugin.id).toBe("apples-big-picture-quiz");
    expect(applesBigPictureQuizPlugin.title).toBe("Apples Big Picture Quiz");
    expect(applesBigPictureQuizPlugin.category).toBe("cards");
    expect(applesBigPictureQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof applesBigPictureQuizPlugin.description).toBe("string");
    expect(applesBigPictureQuizPlugin.description.length).toBeGreaterThan(0);
    expect(applesBigPictureQuizPlugin.settings).toBeDefined();
    expect(applesBigPictureQuizPlugin.settings.dummy.kind).toBe("boolean");
    expect(applesBigPictureQuizPlugin.settings.dummy.default).toBe(false);
    expect(typeof applesBigPictureQuizPlugin.initialState).toBe("function");
    expect(typeof applesBigPictureQuizPlugin.reducer).toBe("function");
    expect(typeof applesBigPictureQuizPlugin.isTerminal).toBe("function");
    expect(typeof applesBigPictureQuizPlugin.hint).toBe("function");
    expect(applesBigPictureQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = applesBigPictureQuizPlugin.initialState(42, S);
    const b = applesBigPictureQuizPlugin.initialState(42, S);
    const c = applesBigPictureQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(TOTAL_QUESTIONS);
    expect(a.phase).toBe("ask");
    expect(a.current).toBe(0);
    expect(a.score).toBe(0);
    expect(a.streak).toBe(0);
    expect(a.lastCorrect).toBeNull();
    expect(a.lastAnswerIdx).toBe(-1);
    // same seed -> same first question text
    expect(b.questions[0]!.q).toBe(a.questions[0]!.q);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.q === c.questions[i]!.q);
    expect(sameOrder).toBe(false);
    expect(applesBigPictureQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while in ask phase and null otherwise", () => {
    const asking = applesBigPictureQuizPlugin.initialState(7, S);
    const target = applesBigPictureQuizPlugin.hint!(asking);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "ask" -- hint should return null.
    const feedback = { ...asking, phase: "feedback" as const };
    expect(applesBigPictureQuizPlugin.hint!(feedback)).toBeNull();

    const done = { ...asking, phase: "done" as const };
    expect(applesBigPictureQuizPlugin.hint!(done)).toBeNull();
  });
});
