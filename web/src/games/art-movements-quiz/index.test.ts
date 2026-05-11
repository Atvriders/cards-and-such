import { describe, it, expect } from "vitest";
import { artMovementsQuizPlugin } from "./index.js";

describe("artMovementsQuizPlugin", () => {
  it("has correct plugin shape", () => {
    expect(artMovementsQuizPlugin.id).toBe("art-movements-quiz");
    expect(artMovementsQuizPlugin.title).toBe("Art Movements Quiz");
    expect(artMovementsQuizPlugin.category).toBe("board");
    expect(artMovementsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof artMovementsQuizPlugin.initialState).toBe("function");
    expect(typeof artMovementsQuizPlugin.reducer).toBe("function");
    expect(typeof artMovementsQuizPlugin.isTerminal).toBe("function");
    expect(typeof artMovementsQuizPlugin.hint).toBe("function");
    expect(artMovementsQuizPlugin.settings).toBeDefined();
  });

  it("initialState is deterministic and isTerminal is null until done", () => {
    const s1 = artMovementsQuizPlugin.initialState(42, { questions: "10" });
    const s2 = artMovementsQuizPlugin.initialState(42, { questions: "10" });
    expect(s1.questions.length).toBe(10);
    expect(s2.questions.length).toBe(10);
    expect(s1.questions.map((q) => q.question)).toEqual(s2.questions.map((q) => q.question));
    expect(s1.currentIndex).toBe(0);
    expect(s1.selected).toBeNull();
    expect(s1.submitted).toBe(false);
    expect(s1.timeLeft).toBe(15);
    expect(s1.score).toBe(0);
    expect(s1.correctCount).toBe(0);
    expect(s1.phase).toBe("playing");
    expect(artMovementsQuizPlugin.isTerminal!(s1)).toBeNull();

    const doneState = { ...s1, phase: "done" as const, score: 250 };
    expect(artMovementsQuizPlugin.isTerminal!(doneState)).toEqual({ score: 250 });
  });

  it("hint returns HintTarget while playing and null when finished", () => {
    const s = artMovementsQuizPlugin.initialState(1, { questions: "10" });
    const playingHint = artMovementsQuizPlugin.hint!(s);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState = { ...s, phase: "done" as const };
    expect(artMovementsQuizPlugin.hint!(doneState)).toBeNull();

    const resultState = { ...s, phase: "result" as const };
    expect(artMovementsQuizPlugin.hint!(resultState)).toBeNull();
  });
});
