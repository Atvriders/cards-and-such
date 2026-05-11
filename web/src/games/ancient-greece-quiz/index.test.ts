import { describe, it, expect } from "vitest";
import { ancientGreeceQuizPlugin } from "./index.js";
import type { AncientGreeceQuizSettings } from "./state.js";

const S: AncientGreeceQuizSettings = { questionCount: "10" };

describe("ancientGreeceQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(ancientGreeceQuizPlugin.id).toBe("ancient-greece-quiz");
    expect(ancientGreeceQuizPlugin.title).toBe("Ancient Greece Quiz");
    expect(ancientGreeceQuizPlugin.category).toBe("board");
    expect(ancientGreeceQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof ancientGreeceQuizPlugin.description).toBe("string");
    expect(ancientGreeceQuizPlugin.description.length).toBeGreaterThan(0);
    expect(ancientGreeceQuizPlugin.settings).toBeDefined();
    expect(ancientGreeceQuizPlugin.settings.questionCount.kind).toBe("enum");
    expect(ancientGreeceQuizPlugin.settings.questionCount.default).toBe("10");
    expect(ancientGreeceQuizPlugin.settings.questionCount.options).toEqual(["5", "10", "15"]);
    expect(typeof ancientGreeceQuizPlugin.initialState).toBe("function");
    expect(typeof ancientGreeceQuizPlugin.reducer).toBe("function");
    expect(typeof ancientGreeceQuizPlugin.isTerminal).toBe("function");
    expect(typeof ancientGreeceQuizPlugin.hint).toBe("function");
    expect(ancientGreeceQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = ancientGreeceQuizPlugin.initialState(42, S);
    const b = ancientGreeceQuizPlugin.initialState(42, S);
    const c = ancientGreeceQuizPlugin.initialState(43, S);
    expect(a.entries.length).toBe(10);
    expect(a.current).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    // each entry has four shuffled choices including the answer
    expect(a.entries[0]!.choices.length).toBe(4);
    expect(a.entries[0]!.choices).toContain(a.entries[0]!.answer);
    // same seed -> same first question text
    expect(b.entries[0]!.question).toBe(a.entries[0]!.question);
    expect(b.entries[0]!.choices).toEqual(a.entries[0]!.choices);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.entries.every((q, i) => q.question === c.entries[i]!.question);
    expect(sameOrder).toBe(false);
    expect(ancientGreeceQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null when done", () => {
    const playing = ancientGreeceQuizPlugin.initialState(7, S);
    const target = ancientGreeceQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, done: true };
    expect(ancientGreeceQuizPlugin.hint!(done)).toBeNull();
    expect(ancientGreeceQuizPlugin.isTerminal(done)).toEqual({ score: playing.score });
  });
});
