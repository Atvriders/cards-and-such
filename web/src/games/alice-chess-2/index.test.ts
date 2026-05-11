import { describe, it, expect } from "vitest";
import { aliceChess2Plugin } from "./index.js";
import type { AliceChess2Settings } from "./state.js";

const S: AliceChess2Settings = { questions: "10" };

describe("aliceChess2Plugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(aliceChess2Plugin.id).toBe("alice-chess-2");
    expect(aliceChess2Plugin.title).toBe("Alice Chess (Mirror)");
    expect(aliceChess2Plugin.category).toBe("board");
    expect(aliceChess2Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aliceChess2Plugin.description).toBe("string");
    expect(aliceChess2Plugin.description.length).toBeGreaterThan(0);
    expect(aliceChess2Plugin.settings).toBeDefined();
    expect(aliceChess2Plugin.settings.questions.kind).toBe("enum");
    expect(aliceChess2Plugin.settings.questions.default).toBe("10");
    expect(aliceChess2Plugin.settings.questions.options).toEqual(["10"]);
    expect(typeof aliceChess2Plugin.initialState).toBe("function");
    expect(typeof aliceChess2Plugin.reducer).toBe("function");
    expect(typeof aliceChess2Plugin.isTerminal).toBe("function");
    expect(typeof aliceChess2Plugin.hint).toBe("function");
    expect(aliceChess2Plugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = aliceChess2Plugin.initialState(42, S);
    const b = aliceChess2Plugin.initialState(42, S);
    const c = aliceChess2Plugin.initialState(43, S);
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
    expect(aliceChess2Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = aliceChess2Plugin.initialState(7, S);
    const target = aliceChess2Plugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-alice-chess-2-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(aliceChess2Plugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(aliceChess2Plugin.hint!(result)).toBeNull();
  });
});
