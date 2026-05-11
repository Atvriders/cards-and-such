import { describe, it, expect } from "vitest";
import { artHeistsQuizPlugin } from "./index.js";
import type { ArtHeistsQuizSettings } from "./state.js";

const S: ArtHeistsQuizSettings = { questions: "10" };

describe("artHeistsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(artHeistsQuizPlugin.id).toBe("art-heists-quiz");
    expect(artHeistsQuizPlugin.title).toBe("Famous Art Heists Quiz");
    expect(artHeistsQuizPlugin.category).toBe("board");
    expect(artHeistsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof artHeistsQuizPlugin.description).toBe("string");
    expect(artHeistsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(artHeistsQuizPlugin.settings).toBeDefined();
    expect(artHeistsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(artHeistsQuizPlugin.settings.questions.default).toBe("10");
    expect(artHeistsQuizPlugin.settings.questions.options).toEqual(["10", "20"]);
    expect(typeof artHeistsQuizPlugin.initialState).toBe("function");
    expect(typeof artHeistsQuizPlugin.reducer).toBe("function");
    expect(typeof artHeistsQuizPlugin.isTerminal).toBe("function");
    expect(typeof artHeistsQuizPlugin.hint).toBe("function");
    expect(artHeistsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = artHeistsQuizPlugin.initialState(42, S);
    const b = artHeistsQuizPlugin.initialState(42, S);
    const c = artHeistsQuizPlugin.initialState(43, S);
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
    expect(artHeistsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = artHeistsQuizPlugin.initialState(7, S);
    const target = artHeistsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" - hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(artHeistsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(artHeistsQuizPlugin.hint!(result)).toBeNull();
  });
});
