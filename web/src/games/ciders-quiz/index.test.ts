import { describe, it, expect } from "vitest";
import { cidersQuizPlugin } from "./index.js";
import type { CidersQuizSettings } from "./state.js";

const S: CidersQuizSettings = { questionCount: "10" };

describe("cidersQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cidersQuizPlugin.id).toBe("ciders-quiz");
    expect(cidersQuizPlugin.title).toBe("Ciders Quiz");
    expect(cidersQuizPlugin.category).toBe("board");
    expect(cidersQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cidersQuizPlugin.description).toBe("string");
    expect(cidersQuizPlugin.description.length).toBeGreaterThan(0);
    expect(cidersQuizPlugin.settings).toBeDefined();
    expect(cidersQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(cidersQuizPlugin.settings.questionCount.default).toBe("10");
    expect(cidersQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof cidersQuizPlugin.initialState).toBe("function");
    expect(typeof cidersQuizPlugin.reducer).toBe("function");
    expect(typeof cidersQuizPlugin.isTerminal).toBe("function");
    expect(typeof cidersQuizPlugin.hint).toBe("function");
    expect(cidersQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cidersQuizPlugin.initialState(42, S);
    const b = cidersQuizPlugin.initialState(42, S);
    const c = cidersQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // each entry has 4 choices and the answer is among them
    expect(a.entries[0]!.choices.length).toBe(4);
    expect(a.entries[0]!.choices).toContain(a.entries[0]!.answer);
    // same seed -> same first question text
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]!.question);
    expect(sameOrder).toBe(false);
    expect(cidersQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when state is done", () => {
    const playing = cidersQuizPlugin.initialState(7, S);
    const target = cidersQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // When done -> hint returns null and isTerminal returns score.
    const done = { ...playing, done: true, score: 30 };
    expect(cidersQuizPlugin.hint!(done)).toBeNull();
    expect(cidersQuizPlugin.isTerminal(done)).toEqual({ score: 30 });
  });
});
