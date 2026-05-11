import { describe, it, expect } from "vitest";
import { birdsQuizPlugin } from "./index.js";
import type { BirdsQuizSettings } from "./state.js";

const S: BirdsQuizSettings = { questions: "10" };

describe("birdsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(birdsQuizPlugin.id).toBe("birds-quiz");
    expect(birdsQuizPlugin.title).toBe("Birds Quiz");
    expect(birdsQuizPlugin.category).toBe("board");
    expect(birdsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof birdsQuizPlugin.description).toBe("string");
    expect(birdsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(birdsQuizPlugin.settings).toBeDefined();
    expect(birdsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(birdsQuizPlugin.settings.questions.default).toBe("10");
    expect(birdsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof birdsQuizPlugin.initialState).toBe("function");
    expect(typeof birdsQuizPlugin.reducer).toBe("function");
    expect(typeof birdsQuizPlugin.isTerminal).toBe("function");
    expect(typeof birdsQuizPlugin.hint).toBe("function");
    expect(birdsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = birdsQuizPlugin.initialState(42, S);
    const b = birdsQuizPlugin.initialState(42, S);
    const c = birdsQuizPlugin.initialState(43, S);
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
    expect(birdsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = birdsQuizPlugin.initialState(7, S);
    const target = birdsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(birdsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(birdsQuizPlugin.hint!(result)).toBeNull();
  });
});
