import { describe, it, expect } from "vitest";
import { bankBrandsQuizPlugin } from "./index.js";
import type { BankBrandsQuizSettings } from "./state.js";

const S: BankBrandsQuizSettings = { questions: "10" };

describe("bankBrandsQuizPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(bankBrandsQuizPlugin.id).toBe("bank-brands-quiz");
    expect(bankBrandsQuizPlugin.title).toBe("Bank Brands Quiz");
    expect(bankBrandsQuizPlugin.category).toBe("board");
    expect(bankBrandsQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bankBrandsQuizPlugin.description).toBe("string");
    expect(bankBrandsQuizPlugin.description.length).toBeGreaterThan(0);
    expect(bankBrandsQuizPlugin.settings).toBeDefined();
    expect(bankBrandsQuizPlugin.settings.questions.kind).toBe("enum");
    expect(bankBrandsQuizPlugin.settings.questions.default).toBe("10");
    expect(bankBrandsQuizPlugin.settings.questions.options).toEqual(["10", "20", "30"]);
    expect(typeof bankBrandsQuizPlugin.initialState).toBe("function");
    expect(typeof bankBrandsQuizPlugin.reducer).toBe("function");
    expect(typeof bankBrandsQuizPlugin.isTerminal).toBe("function");
    expect(typeof bankBrandsQuizPlugin.hint).toBe("function");
    expect(bankBrandsQuizPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = bankBrandsQuizPlugin.initialState(42, S);
    const b = bankBrandsQuizPlugin.initialState(42, S);
    const c = bankBrandsQuizPlugin.initialState(43, S);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.timeLeft).toBe(15);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first question text
    expect(b.questions[0]!.question).toBe(a.questions[0]!.question);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.questions.every((q, i) => q.question === c.questions[i]!.question);
    expect(sameOrder).toBe(false);
    expect(bankBrandsQuizPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = bankBrandsQuizPlugin.initialState(7, S);
    const target = bankBrandsQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(bankBrandsQuizPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(bankBrandsQuizPlugin.hint!(result)).toBeNull();
  });
});
