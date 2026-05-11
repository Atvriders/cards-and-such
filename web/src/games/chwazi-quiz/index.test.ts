import { describe, it, expect } from "vitest";
import { chwaziGamePlugin } from "./index.js";
import type { ChwaziSettings } from "./state.js";

const S: ChwaziSettings = { questions: "10" };

describe("chwaziGamePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chwaziGamePlugin.id).toBe("chwazi-quiz");
    expect(chwaziGamePlugin.title).toBe("Chwazi Quiz");
    expect(chwaziGamePlugin.category).toBe("board");
    expect(chwaziGamePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chwaziGamePlugin.description).toBe("string");
    expect(chwaziGamePlugin.description.length).toBeGreaterThan(0);
    expect(chwaziGamePlugin.settings).toBeDefined();
    expect(chwaziGamePlugin.settings.questions.kind).toBe("enum");
    expect(chwaziGamePlugin.settings.questions.default).toBe("10");
    expect(chwaziGamePlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof chwaziGamePlugin.initialState).toBe("function");
    expect(typeof chwaziGamePlugin.reducer).toBe("function");
    expect(typeof chwaziGamePlugin.isTerminal).toBe("function");
    expect(typeof chwaziGamePlugin.hint).toBe("function");
    expect(chwaziGamePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = chwaziGamePlugin.initialState(42, S);
    const b = chwaziGamePlugin.initialState(42, S);
    const c = chwaziGamePlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(chwaziGamePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chwaziGamePlugin.initialState(7, S);
    const target = chwaziGamePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(chwaziGamePlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(chwaziGamePlugin.hint!(result)).toBeNull();
  });
});
