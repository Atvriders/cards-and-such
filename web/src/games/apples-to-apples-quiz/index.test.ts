import { describe, it, expect } from "vitest";
import { applesToApplesQuizPlugin } from "./index.js";
import type { ApplesToApplesQuizSettings, ApplesToApplesQuizState } from "./state.js";

const S: ApplesToApplesQuizSettings = { dummy: false };

describe("applesToApplesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(applesToApplesQuizPlugin.id).toBe("apples-to-apples-quiz");
    expect(applesToApplesQuizPlugin.title).toBe("Apples to Apples Quiz");
    expect(applesToApplesQuizPlugin.category).toBe("cards");
    expect(applesToApplesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof applesToApplesQuizPlugin.description).toBe("string");
    expect(applesToApplesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof applesToApplesQuizPlugin.howToPlay).toBe("string");
    expect(applesToApplesQuizPlugin.howToPlay.length).toBeGreaterThan(0);
    expect(applesToApplesQuizPlugin.settings).toBeDefined();
    expect(applesToApplesQuizPlugin.settings.dummy.kind).toBe("boolean");
    expect(applesToApplesQuizPlugin.settings.dummy.default).toBe(false);
    expect(typeof applesToApplesQuizPlugin.initialState).toBe("function");
    expect(typeof applesToApplesQuizPlugin.reducer).toBe("function");
    expect(typeof applesToApplesQuizPlugin.isTerminal).toBe("function");
    expect(typeof applesToApplesQuizPlugin.hint).toBe("function");
    expect(applesToApplesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = applesToApplesQuizPlugin.initialState(42, S);
    const b = applesToApplesQuizPlugin.initialState(42, S);
    const c = applesToApplesQuizPlugin.initialState(43, S);

    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("ask");
    expect(a.current).toBe(0);
    expect(a.score).toBe(0);
    expect(a.streak).toBe(0);
    expect(a.lastCorrect).toBeNull();
    expect(a.lastAnswerIdx).toBe(-1);

    // same seed -> identical first question text & answer index
    expect(b.questions[0]!.q).toBe(a.questions[0]!.q);
    expect(b.questions[0]!.answer).toBe(a.questions[0]!.answer);
    expect(b.questions.length).toBe(a.questions.length);

    // different seed should (very likely) produce a different ordering of questions
    const sameOrder = a.questions.every(
      (q, i) => q.q === c.questions[i]!.q,
    );
    expect(sameOrder).toBe(false);

    expect(applesToApplesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while in ask phase and null otherwise", () => {
    const asking = applesToApplesQuizPlugin.initialState(7, S);
    const target = applesToApplesQuizPlugin.hint!(asking);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const feedback: ApplesToApplesQuizState = { ...asking, phase: "feedback" };
    expect(applesToApplesQuizPlugin.hint!(feedback)).toBeNull();

    const done: ApplesToApplesQuizState = { ...asking, phase: "done" };
    expect(applesToApplesQuizPlugin.hint!(done)).toBeNull();
  });
});
