import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("schafkopf initialState", () => {
  it("deals 8 cards to each of 4 players", () => {
    const s = initialState(42, DEF);
    expect(s.hands.length).toBe(4);
    expect(s.hands.every(h => h.length === 8)).toBe(true);
  });

  it("starts in playing phase with no current trick", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("playing");
    expect(s.currentTrick.length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("all 32 cards are dealt (no duplicates)", () => {
    const s = initialState(1, DEF);
    const all = s.hands.flat().map(c => c.id);
    const unique = new Set(all);
    expect(unique.size).toBe(32);
  });
});

describe("schafkopf legalPlays", () => {
  it("can play any card when leading", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(8);
  });
});

describe("schafkopf reducer", () => {
  it("playing a card advances the trick", () => {
    const s = initialState(42, DEF);
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardId: card.id });
    // After player plays, bots auto-play until next player turn or done
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("completes a full hand eventually", () => {
    let s = initialState(5, DEF);
    let iter = 0;
    while (s.phase === "playing" && iter < 100) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns null during play", () => {
    const s = initialState(42, DEF);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(42, DEF);
    const done = { ...s, phase: "done" as const, score: [1, 0] as [number, number] };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(50);
  });
});
