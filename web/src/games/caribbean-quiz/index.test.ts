import { describe, it, expect } from "vitest";
import { caribbeanQuizPlugin } from "./index.js";
import type { CaribbeanQuizSettings } from "./state.js";

const S: CaribbeanQuizSettings = { questions: "10" };

describe("caribbeanQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(caribbeanQuizPlugin.id).toBe("caribbean-quiz");
    expect(caribbeanQuizPlugin.title).toBe("Caribbean Quiz");
    expect(caribbeanQuizPlugin.category).toBe("board");
    expect(caribbeanQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof caribbeanQuizPlugin.description).toBe("string");
    expect(caribbeanQuizPlugin.description.length).toBeGreaterThan(0);
    expect(caribbeanQuizPlugin.settings).toBeDefined();
    expect(caribbeanQuizPlugin.settings.questions.kind).toBe("enum");
    expect(caribbeanQuizPlugin.settings.questions.default).toBe("10");
    expect(caribbeanQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof caribbeanQuizPlugin.initialState).toBe("function");
    expect(typeof caribbeanQuizPlugin.reducer).toBe("function");
    expect(typeof caribbeanQuizPlugin.isTerminal).toBe("function");
    expect(typeof caribbeanQuizPlugin.hint).toBe("function");
    expect(caribbeanQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = caribbeanQuizPlugin.initialState(42, S);
    const b = caribbeanQuizPlugin.initialState(42, S);
    const c = caribbeanQuizPlugin.initialState(43, S);
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
    expect(caribbeanQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = caribbeanQuizPlugin.initialState(7, S);
    const target = caribbeanQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -> hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(caribbeanQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(caribbeanQuizPlugin.hint!(result)).toBeNull();
  });
});
