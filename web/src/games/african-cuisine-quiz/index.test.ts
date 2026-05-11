import { describe, it, expect } from "vitest";
import { africanCuisineQuizPlugin } from "./index.js";
import type { AfricanCuisineQuizSettings } from "./state.js";

const S: AfricanCuisineQuizSettings = { questionCount: "10" };

describe("africanCuisineQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(africanCuisineQuizPlugin.id).toBe("african-cuisine-quiz");
    expect(africanCuisineQuizPlugin.title).toBe("African Cuisine Quiz");
    expect(africanCuisineQuizPlugin.category).toBe("board");
    expect(africanCuisineQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof africanCuisineQuizPlugin.description).toBe("string");
    expect(africanCuisineQuizPlugin.description.length).toBeGreaterThan(0);
    expect(africanCuisineQuizPlugin.settings).toBeDefined();
    expect(africanCuisineQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(africanCuisineQuizPlugin.settings.questionCount.default).toBe("10");
    expect(africanCuisineQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof africanCuisineQuizPlugin.initialState).toBe("function");
    expect(typeof africanCuisineQuizPlugin.reducer).toBe("function");
    expect(typeof africanCuisineQuizPlugin.isTerminal).toBe("function");
    expect(typeof africanCuisineQuizPlugin.hint).toBe("function");
    expect(africanCuisineQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = africanCuisineQuizPlugin.initialState(42, S);
    const b = africanCuisineQuizPlugin.initialState(42, S);
    const c = africanCuisineQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // same seed -> identical question ordering
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    expect(b.entries.map(e => e.question)).toEqual(a.entries.map(e => e.question));
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]!.question);
    expect(sameOrder).toBe(false);
    // each entry has exactly 4 choices and includes its correct answer
    for (const entry of a.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.answer);
    }
    expect(africanCuisineQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null when done", () => {
    const playing = africanCuisineQuizPlugin.initialState(7, S);
    const target = africanCuisineQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // When done, hint returns null and isTerminal returns a result.
    const done = { ...playing, done: true };
    expect(africanCuisineQuizPlugin.hint!(done)).toBeNull();
    expect(africanCuisineQuizPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
