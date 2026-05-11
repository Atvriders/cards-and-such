import { describe, it, expect } from "vitest";
import { chineseCuisineQuizPlugin } from "./index.js";
import type { ChineseCuisineQuizSettings } from "./state.js";

const S: ChineseCuisineQuizSettings = { questionCount: "10" };

describe("chineseCuisineQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chineseCuisineQuizPlugin.id).toBe("chinese-cuisine-quiz");
    expect(chineseCuisineQuizPlugin.title).toBe("Chinese Cuisine Quiz");
    expect(chineseCuisineQuizPlugin.category).toBe("board");
    expect(chineseCuisineQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chineseCuisineQuizPlugin.description).toBe("string");
    expect(chineseCuisineQuizPlugin.description.length).toBeGreaterThan(0);
    expect(chineseCuisineQuizPlugin.settings).toBeDefined();
    expect(chineseCuisineQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(chineseCuisineQuizPlugin.settings.questionCount.default).toBe("10");
    expect(chineseCuisineQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof chineseCuisineQuizPlugin.initialState).toBe("function");
    expect(typeof chineseCuisineQuizPlugin.reducer).toBe("function");
    expect(typeof chineseCuisineQuizPlugin.isTerminal).toBe("function");
    expect(typeof chineseCuisineQuizPlugin.hint).toBe("function");
    expect(chineseCuisineQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chineseCuisineQuizPlugin.initialState(42, S);
    const b = chineseCuisineQuizPlugin.initialState(42, S);
    const c = chineseCuisineQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // same seed -> identical first question
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    expect(b.entries[0]!.choices).toEqual(a.entries[0]!.choices);
    // every entry should have 4 choices, one of which is the answer
    for (const e of a.entries) {
      expect(e.choices.length).toBeGreaterThanOrEqual(2);
      expect(e.choices).toContain(e.answer);
    }
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]!.question);
    expect(sameOrder).toBe(false);
    expect(chineseCuisineQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when not done and null once done", () => {
    const playing = chineseCuisineQuizPlugin.initialState(7, S);
    const target = chineseCuisineQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, done: true };
    expect(chineseCuisineQuizPlugin.hint!(done)).toBeNull();
    expect(chineseCuisineQuizPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
