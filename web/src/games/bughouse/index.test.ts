import { describe, it, expect } from "vitest";
import { bughousePlugin } from "./index.js";
import type { BughouseSettings } from "./state.js";

const S: BughouseSettings = { questions: "10" };

describe("bughousePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bughousePlugin.id).toBe("bughouse");
    expect(bughousePlugin.title).toBe("Bughouse Chess Tactics");
    expect(bughousePlugin.category).toBe("board");
    expect(bughousePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bughousePlugin.description).toBe("string");
    expect(bughousePlugin.description.length).toBeGreaterThan(0);
    expect(bughousePlugin.settings).toBeDefined();
    expect(bughousePlugin.settings.questions.kind).toBe("enum");
    expect(bughousePlugin.settings.questions.default).toBe("10");
    expect(bughousePlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof bughousePlugin.initialState).toBe("function");
    expect(typeof bughousePlugin.reducer).toBe("function");
    expect(typeof bughousePlugin.isTerminal).toBe("function");
    expect(typeof bughousePlugin.hint).toBe("function");
    expect(bughousePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bughousePlugin.initialState(42, S);
    const b = bughousePlugin.initialState(42, S);
    const c = bughousePlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text and same choice ordering
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    // different seed should (very likely) produce a different ordering of choices or questions
    const sameOrder = a.questions.every(
      (q, i) =>
        q.question === c.questions[i]!.question &&
        q.choices.every((ch, j) => ch === c.questions[i]!.choices[j]),
    );
    expect(sameOrder).toBe(false);
    expect(bughousePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bughousePlugin.initialState(7, S);
    const target = bughousePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-bughouse-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(bughousePlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bughousePlugin.hint!(result)).toBeNull();
  });
});
