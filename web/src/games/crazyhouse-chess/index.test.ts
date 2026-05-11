import { describe, it, expect } from "vitest";
import { crazyhouseChessPlugin } from "./index.js";
import type { CrazyhouseChessSettings } from "./state.js";

const S: CrazyhouseChessSettings = { questions: "10" };

describe("crazyhouseChessPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(crazyhouseChessPlugin.id).toBe("crazyhouse-chess");
    expect(crazyhouseChessPlugin.title).toBe("Crazyhouse Chess");
    expect(crazyhouseChessPlugin.category).toBe("board");
    expect(crazyhouseChessPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crazyhouseChessPlugin.description).toBe("string");
    expect(crazyhouseChessPlugin.description.length).toBeGreaterThan(0);
    expect(crazyhouseChessPlugin.settings).toBeDefined();
    expect(crazyhouseChessPlugin.settings.questions.kind).toBe("enum");
    expect(crazyhouseChessPlugin.settings.questions.default).toBe("10");
    expect(crazyhouseChessPlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof crazyhouseChessPlugin.initialState).toBe("function");
    expect(typeof crazyhouseChessPlugin.reducer).toBe("function");
    expect(typeof crazyhouseChessPlugin.isTerminal).toBe("function");
    expect(typeof crazyhouseChessPlugin.hint).toBe("function");
    expect(crazyhouseChessPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = crazyhouseChessPlugin.initialState(42, S);
    const b = crazyhouseChessPlugin.initialState(42, S);
    const c = crazyhouseChessPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    // same seed -> identical first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(crazyhouseChessPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = crazyhouseChessPlugin.initialState(7, S);
    const target = crazyhouseChessPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-crazyhouse-chess-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(crazyhouseChessPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(crazyhouseChessPlugin.hint!(result)).toBeNull();
  });
});
