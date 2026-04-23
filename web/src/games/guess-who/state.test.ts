import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, CHARACTERS, QUESTIONS } from "./state.js";

const settings = { dummy: "yes" as const };

describe("Guess Who", () => {
  it("initializes with 20 characters, no eliminations, phase=asking", () => {
    const s = initialState(42, settings);
    expect(CHARACTERS).toHaveLength(20);
    expect(s.playerEliminated.every((v) => !v)).toBe(true);
    expect(s.phase).toBe("asking");
    expect(s.questionsAsked).toBe(0);
  });

  it("asking a question eliminates some characters", () => {
    const s = initialState(42, settings);
    // Ask "Does your character have brown hair?" (question 0)
    const next = reducer(s, { type: "ask", questionIdx: 0 });
    const eliminated = next.playerEliminated.filter(Boolean).length;
    expect(eliminated).toBeGreaterThan(0);
    expect(next.questionsAsked).toBe(1);
    expect(next.lastQuestion).not.toBeNull();
    expect(next.lastAnswer).not.toBeNull();
  });

  it("correct guess wins the game", () => {
    const s = initialState(42, settings);
    const correctId = s.playerCharId;
    const next = reducer(s, { type: "guess", charId: correctId });
    expect(next.phase).toBe("win");
  });

  it("incorrect guess loses the game", () => {
    const s = initialState(42, settings);
    const wrongId = (s.playerCharId + 1) % CHARACTERS.length;
    const next = reducer(s, { type: "guess", charId: wrongId });
    expect(next.phase).toBe("loss");
  });

  it("isTerminal returns null during asking phase", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 on win", () => {
    const s = initialState(42, settings);
    const won = { ...s, phase: "win" as const };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("isTerminal returns score 0 on loss", () => {
    const s = initialState(42, settings);
    const lost = { ...s, phase: "loss" as const };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("questions answer truthfully based on bot's character", () => {
    const s = initialState(42, settings);
    const botChar = CHARACTERS[s.playerCharId]!;
    // Find a question about hair color matching bot's hair
    const q = QUESTIONS.find((q) => q.key === "hair" && q.value === botChar.hair)!;
    const qIdx = QUESTIONS.indexOf(q);
    const next = reducer(s, { type: "ask", questionIdx: qIdx });
    expect(next.lastAnswer).toBe(true);
  });

  it("QUESTIONS has at least 17 unique questions", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(17);
  });

  it("all 20 characters have unique names", () => {
    const names = CHARACTERS.map((c) => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(20);
  });
});
