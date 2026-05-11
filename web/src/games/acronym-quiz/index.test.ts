import { describe, it, expect } from "vitest";
import { acronymQuizPlugin } from "./index.js";
import type { AcronymQuizSettings } from "./state.js";

const S: AcronymQuizSettings = { questionCount: "10" };

describe("acronymQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(acronymQuizPlugin.id).toBe("acronym-quiz");
    expect(acronymQuizPlugin.title).toBe("Acronym Quiz");
    expect(acronymQuizPlugin.category).toBe("board");
    expect(acronymQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acronymQuizPlugin.description).toBe("string");
    expect(acronymQuizPlugin.description.length).toBeGreaterThan(0);
    expect(acronymQuizPlugin.settings).toBeDefined();
    expect(acronymQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(acronymQuizPlugin.settings.questionCount.default).toBe("10");
    expect(acronymQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof acronymQuizPlugin.initialState).toBe("function");
    expect(typeof acronymQuizPlugin.reducer).toBe("function");
    expect(typeof acronymQuizPlugin.isTerminal).toBe("function");
    expect(typeof acronymQuizPlugin.hint).toBe("function");
    expect(acronymQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = acronymQuizPlugin.initialState(42, S);
    const b = acronymQuizPlugin.initialState(42, S);
    const c = acronymQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // each entry has 4 choices and the answer is one of them
    for (const entry of a.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.answer);
    }
    // same seed -> same first acronym
    expect(b.entries[0]!.acronym).toBe(a.entries[0]!.acronym);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((e, i) => e.acronym === c.entries[i]!.acronym);
    expect(sameOrder).toBe(false);
    expect(acronymQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null when done", () => {
    const playing = acronymQuizPlugin.initialState(7, S);
    const target = acronymQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, done: true };
    expect(acronymQuizPlugin.hint!(done)).toBeNull();
    expect(acronymQuizPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
