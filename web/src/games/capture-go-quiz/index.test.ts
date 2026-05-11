import { describe, it, expect } from "vitest";
import { captureGoPlugin } from "./index.js";
import type { CaptureGoSettings, CaptureGoState } from "./state.js";

const S: CaptureGoSettings = { questions: "10" };

describe("captureGoPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(captureGoPlugin.id).toBe("capture-go-quiz");
    expect(captureGoPlugin.title).toBe("Capture Go Quiz");
    expect(captureGoPlugin.category).toBe("board");
    expect(captureGoPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof captureGoPlugin.description).toBe("string");
    expect(captureGoPlugin.description.length).toBeGreaterThan(0);
    expect(captureGoPlugin.settings).toBeDefined();
    expect(captureGoPlugin.settings.questions.kind).toBe("enum");
    expect(captureGoPlugin.settings.questions.default).toBe("10");
    expect(captureGoPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof captureGoPlugin.initialState).toBe("function");
    expect(typeof captureGoPlugin.reducer).toBe("function");
    expect(typeof captureGoPlugin.isTerminal).toBe("function");
    expect(typeof captureGoPlugin.hint).toBe("function");
    expect(captureGoPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = captureGoPlugin.initialState(42, S);
    const b = captureGoPlugin.initialState(42, S);
    const c = captureGoPlugin.initialState(43, S);
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
    expect(captureGoPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = captureGoPlugin.initialState(7, S);
    const target = captureGoPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done: CaptureGoState = { ...playing, phase: "done" };
    expect(captureGoPlugin.hint!(done)).toBeNull();

    const result: CaptureGoState = { ...playing, phase: "result" };
    expect(captureGoPlugin.hint!(result)).toBeNull();
  });
});
