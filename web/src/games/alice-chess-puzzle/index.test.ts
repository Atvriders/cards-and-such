import { describe, it, expect } from "vitest";
import { aliceChessPuzzlePlugin } from "./index.js";
import type { AliceChessPuzzleSettings } from "./state.js";

const S: AliceChessPuzzleSettings = { questions: "10" };

describe("aliceChessPuzzlePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(aliceChessPuzzlePlugin.id).toBe("alice-chess-puzzle");
    expect(aliceChessPuzzlePlugin.title).toBe("Alice Chess Puzzle");
    expect(aliceChessPuzzlePlugin.category).toBe("board");
    expect(aliceChessPuzzlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aliceChessPuzzlePlugin.description).toBe("string");
    expect(aliceChessPuzzlePlugin.description.length).toBeGreaterThan(0);
    expect(aliceChessPuzzlePlugin.settings).toBeDefined();
    expect(aliceChessPuzzlePlugin.settings.questions.kind).toBe("enum");
    expect(aliceChessPuzzlePlugin.settings.questions.default).toBe("10");
    expect(aliceChessPuzzlePlugin.settings.questions.options).toEqual(["10"]);
    expect(typeof aliceChessPuzzlePlugin.initialState).toBe("function");
    expect(typeof aliceChessPuzzlePlugin.reducer).toBe("function");
    expect(typeof aliceChessPuzzlePlugin.isTerminal).toBe("function");
    expect(typeof aliceChessPuzzlePlugin.hint).toBe("function");
    expect(aliceChessPuzzlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = aliceChessPuzzlePlugin.initialState(42, S);
    const b = aliceChessPuzzlePlugin.initialState(42, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    // same seed -> same first question text and same correct index
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    expect(b.questions[0]!.correct).toBe(a.questions[0]!.correct);
    expect(b.questions[0]!.choices).toEqual(a.questions[0]!.choices);
    // each question still has 4 choices and a valid correct index
    for (const q of a.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    }
    expect(aliceChessPuzzlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = aliceChessPuzzlePlugin.initialState(7, S);
    const target = aliceChessPuzzlePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-alice-chess-puzzle-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" -> hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(aliceChessPuzzlePlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(aliceChessPuzzlePlugin.hint!(result)).toBeNull();
  });
});
