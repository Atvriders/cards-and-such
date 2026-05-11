import { describe, it, expect } from "vitest";
import { twoThousandsQuizPlugin } from "./index.js";
import type { TwoThousandsQuizSettings } from "./state.js";

const S: TwoThousandsQuizSettings = { questions: "10" };

describe("twoThousandsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(twoThousandsQuizPlugin.id).toBe("2000s-quiz");
    expect(twoThousandsQuizPlugin.title).toBe("2000s Y2K Era Quiz");
    expect(twoThousandsQuizPlugin.category).toBe("board");
    expect(twoThousandsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof twoThousandsQuizPlugin.description).toBe("string");
    expect(twoThousandsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(typeof twoThousandsQuizPlugin.howToPlay).toBe("string");
    expect(twoThousandsQuizPlugin.howToPlay!.length).toBeGreaterThan(0);
    expect(twoThousandsQuizPlugin.settings).toBeDefined();
    expect(twoThousandsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(twoThousandsQuizPlugin.settings.questions.default).toBe("10");
    expect(twoThousandsQuizPlugin.settings.questions.options).toEqual(["10", "15"]);
    expect(typeof twoThousandsQuizPlugin.initialState).toBe("function");
    expect(typeof twoThousandsQuizPlugin.reducer).toBe("function");
    expect(typeof twoThousandsQuizPlugin.isTerminal).toBe("function");
    expect(typeof twoThousandsQuizPlugin.hint).toBe("function");
    expect(twoThousandsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = twoThousandsQuizPlugin.initialState(42, S);
    const b = twoThousandsQuizPlugin.initialState(42, S);
    const c = twoThousandsQuizPlugin.initialState(43, S);
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
    expect(twoThousandsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = twoThousandsQuizPlugin.initialState(7, S);
    const target = twoThousandsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(twoThousandsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(twoThousandsQuizPlugin.hint!(result)).toBeNull();
  });
});
