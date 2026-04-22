import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FiveDiceState } from "./state.js";

const settings = { bestOf: "5" as const };

describe("initialState", () => {
  it("starts with round 1, no wins", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.playerWins).toBe(0);
    expect(s.botWins).toBe(0);
    expect(s.phase).toBe("rolling");
    expect(s.maxRounds).toBe(5);
  });
});

describe("roll action", () => {
  it("produces dice for both players", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    const lastRound = s2.rounds[s2.rounds.length - 1]!;
    expect(lastRound.playerDice).toHaveLength(5);
    expect(lastRound.botDice).toHaveLength(5);
    expect(lastRound.playerSum).toBeGreaterThanOrEqual(5);
    expect(lastRound.playerSum).toBeLessThanOrEqual(30);
  });

  it("records winner of round correctly", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    const lastRound = s2.rounds[0]!;
    if (lastRound.playerSum > lastRound.botSum) {
      expect(lastRound.winner).toBe("player");
      expect(s2.playerWins).toBe(1);
    } else if (lastRound.botSum > lastRound.playerSum) {
      expect(lastRound.winner).toBe("bot");
      expect(s2.botWins).toBe(1);
    } else {
      expect(lastRound.winner).toBe("tie");
    }
  });

  it("game ends after max rounds", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "roll" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.finalWinner).not.toBeNull();
  });

  it("best-of-3 ends after 3 rounds", () => {
    let s = initialState(99, { bestOf: "3" as const });
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "roll" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.rounds).toHaveLength(3);
  });
});

describe("nextRound action", () => {
  it("advances round counter", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    if (s2.phase === "roundOver") {
      const s3 = reducer(s2, { type: "nextRound" });
      expect(s3.round).toBe(2);
      expect(s3.phase).toBe("rolling");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("player win gives score 100", () => {
    const s: FiveDiceState = { ...initialState(42, settings), gameOver: true, finalWinner: "player" };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("bot win gives score 0", () => {
    const s: FiveDiceState = { ...initialState(42, settings), gameOver: true, finalWinner: "bot" };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("tie gives score 50", () => {
    const s: FiveDiceState = { ...initialState(42, settings), gameOver: true, finalWinner: "tie" };
    expect(isTerminal(s)).toEqual({ score: 50 });
  });
});
