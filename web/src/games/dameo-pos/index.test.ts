import { describe, it, expect } from "vitest";
import { dameoPosPlugin } from "./index.js";
import type { DameoPosSettings } from "./state.js";

const S: DameoPosSettings = { questions: "10" };

describe("dameoPosPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(dameoPosPlugin.id).toBe("dameo-pos");
    expect(dameoPosPlugin.title).toBe("Dameo Positions");
    expect(dameoPosPlugin.category).toBe("board");
    expect(dameoPosPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dameoPosPlugin.description).toBe("string");
    expect(dameoPosPlugin.description.length).toBeGreaterThan(0);
    expect(dameoPosPlugin.settings).toBeDefined();
    expect(dameoPosPlugin.settings.questions.kind).toBe("enum");
    expect(dameoPosPlugin.settings.questions.default).toBe("10");
    expect(dameoPosPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof dameoPosPlugin.initialState).toBe("function");
    expect(typeof dameoPosPlugin.reducer).toBe("function");
    expect(typeof dameoPosPlugin.isTerminal).toBe("function");
    expect(typeof dameoPosPlugin.hint).toBe("function");
    expect(dameoPosPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = dameoPosPlugin.initialState(42, S);
    const b = dameoPosPlugin.initialState(42, S);
    const c = dameoPosPlugin.initialState(43, S);
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
    // different seed should produce a different ordering (small pool, but choices are reshuffled too)
    const sameQuestionsAndCorrect = a.questions.every(
      (q, i) => q.question === c.questions[i]!.question && q.correct === c.questions[i]!.correct,
    );
    expect(sameQuestionsAndCorrect).toBe(false);
    expect(dameoPosPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = dameoPosPlugin.initialState(7, S);
    const target = dameoPosPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-dameo-pos-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(dameoPosPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(dameoPosPlugin.hint!(result)).toBeNull();
  });
});
