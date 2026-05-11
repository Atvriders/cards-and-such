import { describe, it, expect } from "vitest";
import { ashtapadaPlugin } from "./index.js";
import type { AshtapadaSettings, AshtapadaState } from "./state.js";

const S: AshtapadaSettings = { questions: "10" };

describe("ashtapadaPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(ashtapadaPlugin.id).toBe("ashtapada-quiz");
    expect(ashtapadaPlugin.title).toBe("Ashtapada Quiz");
    expect(ashtapadaPlugin.category).toBe("board");
    expect(ashtapadaPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof ashtapadaPlugin.description).toBe("string");
    expect(ashtapadaPlugin.description.length).toBeGreaterThan(0);
    expect(ashtapadaPlugin.settings).toBeDefined();
    expect(ashtapadaPlugin.settings.questions.kind).toBe("enum");
    expect(ashtapadaPlugin.settings.questions.default).toBe("10");
    expect(ashtapadaPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof ashtapadaPlugin.initialState).toBe("function");
    expect(typeof ashtapadaPlugin.reducer).toBe("function");
    expect(typeof ashtapadaPlugin.isTerminal).toBe("function");
    expect(typeof ashtapadaPlugin.hint).toBe("function");
    expect(ashtapadaPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = ashtapadaPlugin.initialState(42, S);
    const b = ashtapadaPlugin.initialState(42, S);
    const c = ashtapadaPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text and choices
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering of questions or choices
    const identical = a.questions.every(
      (q, i) =>
        q.question === c.questions[i]!.question &&
        q.choices.every((ch, j) => ch === c.questions[i]!.choices[j]),
    );
    expect(identical).toBe(false);
    // every chosen correct index must point to a real choice slot
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    expect(ashtapadaPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = ashtapadaPlugin.initialState(7, S);
    const target = ashtapadaPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: AshtapadaState = { ...playing, phase: "done" };
    expect(ashtapadaPlugin.hint!(done)).toBeNull();

    const result: AshtapadaState = { ...playing, phase: "result" };
    expect(ashtapadaPlugin.hint!(result)).toBeNull();
  });
});
