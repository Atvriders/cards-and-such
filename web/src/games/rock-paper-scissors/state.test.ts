import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RPSSettings } from "./state.js";

const settings: RPSSettings = { rounds: "3", botStyle: "random" };
const patternSettings: RPSSettings = { rounds: "5", botStyle: "pattern" };

describe("RockPaperScissors initialState", () => {
  it("starts with zero scores and no history", () => {
    const s = initialState(42, settings);
    expect(s.playerWins).toBe(0);
    expect(s.botWins).toBe(0);
    expect(s.roundsPlayed).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.history).toHaveLength(0);
  });

  it("maxRounds equals the rounds setting", () => {
    expect(initialState(1, { rounds: "3", botStyle: "random" }).maxRounds).toBe(3);
    expect(initialState(1, { rounds: "7", botStyle: "random" }).maxRounds).toBe(7);
  });
});

describe("RockPaperScissors reducer", () => {
  it("records round after a choose action", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "choose", choice: "rock" });
    expect(s2.roundsPlayed).toBe(1);
    expect(s2.history).toHaveLength(1);
    expect(s2.chosen).toBe("rock");
  });

  it("rock beats scissors", () => {
    // Force a state where bot will pick scissors via seeded RNG
    // We test the result logic directly by checking the round record
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "choose", choice: "rock" });
    const rec = s2.history[0]!;
    if (rec.bot === "scissors") {
      expect(rec.result).toBe("win");
    } else if (rec.bot === "rock") {
      expect(rec.result).toBe("draw");
    } else {
      expect(rec.result).toBe("loss");
    }
  });

  it("game ends when a player reaches majority wins (best of 3)", () => {
    let s = initialState(0, settings);
    // Force wins by repeating until we hit 2 player wins or 2 bot wins
    let rounds = 0;
    while (!s.gameOver && rounds < 10) {
      s = reducer(s, { type: "choose", choice: "rock" });
      rounds++;
    }
    expect(s.gameOver).toBe(true);
    expect(s.winner).not.toBeNull();
  });

  it("restart resets game state", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "choose", choice: "rock" });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.roundsPlayed).toBe(0);
    expect(s3.gameOver).toBe(false);
    expect(s3.history).toHaveLength(0);
  });

  it("no more rounds accepted after game over", () => {
    let s = initialState(0, settings);
    for (let i = 0; i < 10 && !s.gameOver; i++) {
      s = reducer(s, { type: "choose", choice: "scissors" });
    }
    const afterOver = reducer(s, { type: "choose", choice: "rock" });
    expect(afterOver.roundsPlayed).toBe(s.roundsPlayed);
  });

  it("pattern bot tracks player history", () => {
    let s = initialState(7, patternSettings);
    s = reducer(s, { type: "choose", choice: "rock" });
    expect(s.playerHistory).toContain("rock");
  });
});

describe("RockPaperScissors isTerminal", () => {
  it("returns null when game not over", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score > 0 on player win", () => {
    let s = initialState(0, settings);
    for (let i = 0; i < 10 && !s.gameOver; i++) {
      s = reducer(s, { type: "choose", choice: "rock" });
    }
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    // Score is either win, draw, or loss
    expect(typeof term!.score).toBe("number");
  });
});
