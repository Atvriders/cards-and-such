import { describe, it, expect } from "vitest";
import { alliterationPickPlugin } from "./index.js";
import type { AlliterationPickSettings } from "./state.js";

const S: AlliterationPickSettings = { questions: "10" };

describe("alliterationPickPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(alliterationPickPlugin.id).toBe("alliteration-pick");
    expect(alliterationPickPlugin.title).toBe("Alliteration Pick");
    expect(alliterationPickPlugin.category).toBe("board");
    expect(alliterationPickPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof alliterationPickPlugin.description).toBe("string");
    expect(alliterationPickPlugin.description.length).toBeGreaterThan(0);
    expect(alliterationPickPlugin.settings).toBeDefined();
    expect(alliterationPickPlugin.settings.questions.kind).toBe("enum");
    expect(alliterationPickPlugin.settings.questions.default).toBe("10");
    expect(alliterationPickPlugin.settings.questions.options).toEqual(["8", "10", "12"]);
    expect(typeof alliterationPickPlugin.initialState).toBe("function");
    expect(typeof alliterationPickPlugin.reducer).toBe("function");
    expect(typeof alliterationPickPlugin.isTerminal).toBe("function");
    expect(typeof alliterationPickPlugin.hint).toBe("function");
    expect(alliterationPickPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = alliterationPickPlugin.initialState(42, S);
    const b = alliterationPickPlugin.initialState(42, S);
    const c = alliterationPickPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(alliterationPickPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = alliterationPickPlugin.initialState(7, S);
    const target = alliterationPickPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-alliteration-pick-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(alliterationPickPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(alliterationPickPlugin.hint!(result)).toBeNull();
  });
});
