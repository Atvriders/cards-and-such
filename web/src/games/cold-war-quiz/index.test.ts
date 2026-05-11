import { describe, it, expect } from "vitest";
import { coldWarQuizPlugin } from "./index.js";
import type { ColdWarQuizSettings, ColdWarQuizState } from "./state.js";

const S: ColdWarQuizSettings = { questionCount: "10" };

describe("coldWarQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(coldWarQuizPlugin.id).toBe("cold-war-quiz");
    expect(coldWarQuizPlugin.title).toBe("Cold War Quiz");
    expect(coldWarQuizPlugin.category).toBe("board");
    expect(coldWarQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coldWarQuizPlugin.description).toBe("string");
    expect(coldWarQuizPlugin.description.length).toBeGreaterThan(0);
    expect(coldWarQuizPlugin.settings).toBeDefined();
    expect(coldWarQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(coldWarQuizPlugin.settings.questionCount.default).toBe("10");
    expect(coldWarQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof coldWarQuizPlugin.initialState).toBe("function");
    expect(typeof coldWarQuizPlugin.reducer).toBe("function");
    expect(typeof coldWarQuizPlugin.isTerminal).toBe("function");
    expect(typeof coldWarQuizPlugin.hint).toBe("function");
    expect(coldWarQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = coldWarQuizPlugin.initialState(42, S);
    const b = coldWarQuizPlugin.initialState(42, S);
    const c = coldWarQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    expect(a.settings.questionCount).toBe("10");
    // every entry should have 4 choices containing the answer
    for (const entry of a.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.answer);
    }
    // same seed -> same first question text
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]!.question);
    expect(sameOrder).toBe(false);
    expect(coldWarQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null when done", () => {
    const playing = coldWarQuizPlugin.initialState(7, S);
    const target = coldWarQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force done -> hint should return null.
    const done: ColdWarQuizState = { ...playing, done: true };
    expect(coldWarQuizPlugin.hint!(done)).toBeNull();
    expect(coldWarQuizPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
