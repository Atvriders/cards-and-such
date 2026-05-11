import { describe, it, expect } from "vitest";
import { danceStylesQuizPlugin } from "./index.js";
import type { DanceStylesQuizSettings } from "./state.js";

const S: DanceStylesQuizSettings = { questionCount: "10" };

describe("danceStylesQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(danceStylesQuizPlugin.id).toBe("dance-styles-quiz");
    expect(danceStylesQuizPlugin.title).toBe("Dance Styles Quiz");
    expect(danceStylesQuizPlugin.category).toBe("board");
    expect(danceStylesQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof danceStylesQuizPlugin.description).toBe("string");
    expect(danceStylesQuizPlugin.description.length).toBeGreaterThan(0);
    expect(danceStylesQuizPlugin.settings).toBeDefined();
    expect(danceStylesQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(danceStylesQuizPlugin.settings.questionCount.default).toBe("10");
    expect(danceStylesQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof danceStylesQuizPlugin.initialState).toBe("function");
    expect(typeof danceStylesQuizPlugin.reducer).toBe("function");
    expect(typeof danceStylesQuizPlugin.isTerminal).toBe("function");
    expect(typeof danceStylesQuizPlugin.hint).toBe("function");
    expect(danceStylesQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = danceStylesQuizPlugin.initialState(42, S);
    const b = danceStylesQuizPlugin.initialState(42, S);
    const c = danceStylesQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // each entry has 4 choices including the correct answer
    expect(a.entries[0]!.choices.length).toBe(4);
    expect(a.entries[0]!.choices).toContain(a.entries[0]!.answer);
    // same seed -> same first question
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]?.question);
    expect(sameOrder).toBe(false);
    expect(danceStylesQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null once done", () => {
    const playing = danceStylesQuizPlugin.initialState(7, S);
    const target = danceStylesQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force done -> hint should return null and isTerminal should report a score.
    const done = { ...playing, done: true, score: 30 };
    expect(danceStylesQuizPlugin.hint!(done)).toBeNull();
    expect(danceStylesQuizPlugin.isTerminal(done)).toEqual({ score: 30 });
  });
});
