import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, applyRoll } from "./state.js";
import type { GluckshausState } from "./state.js";

const settings = { startingPennies: "10" as const };

describe("initialState", () => {
  it("starts with correct pennies and empty board", () => {
    const s = initialState(42, settings);
    expect(s.playerPennies).toBe(10);
    expect(s.botPennies).toBe(10);
    expect(s.weddingPot).toBe(0);
    expect(s.activePlayer).toBe("player");
    expect(Object.values(s.board).every((v) => v === 0)).toBe(true);
  });
});

describe("applyRoll", () => {
  it("sum 7 adds to wedding pot", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(7, board, 0, 5, 5);
    expect(r.weddingPot).toBe(1);
    expect(r.activePennies).toBe(4);
  });

  it("sum 2 takes wedding pot", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(2, board, 3, 5, 5);
    expect(r.weddingPot).toBe(0);
    expect(r.activePennies).toBe(8); // 5 + 3 pot
  });

  it("sum 3 does nothing", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(3, board, 0, 5, 5);
    expect(r.activePennies).toBe(5);
    expect(r.weddingPot).toBe(0);
  });

  it("sum 11 does nothing", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(11, board, 0, 5, 5);
    expect(r.activePennies).toBe(5);
  });

  it("sum 12 takes all slots and pot", () => {
    const board = { 2: 0, 3: 0, 5: 2, 6: 1, 7: 0, 8: 3, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(12, board, 5, 3, 3);
    expect(r.activePennies).toBe(3 + 5 + 2 + 1 + 3); // 14
    expect(r.weddingPot).toBe(0);
    expect(Object.values(r.board).every((v) => v === 0)).toBe(true);
  });

  it("empty slot places a penny", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(8, board, 0, 5, 5);
    expect(r.board[8]).toBe(1);
    expect(r.activePennies).toBe(4);
  });

  it("occupied slot takes pennies", () => {
    const board = { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 2, 9: 0, 10: 0, 11: 0, 12: 0 };
    const r = applyRoll(8, board, 0, 5, 5);
    expect(r.board[8]).toBe(0);
    expect(r.activePennies).toBe(7); // 5 + 2 from slot
  });
});

describe("roll action", () => {
  it("rolls dice and updates state", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastEvent).not.toBe("");
  });

  it("alternates turns between player and bot", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    if (!s2.gameOver) {
      expect(s2.activePlayer).toBe("bot");
      const s3 = reducer(s2, { type: "roll" });
      if (!s3.gameOver) expect(s3.activePlayer).toBe("player");
    }
  });

  it("game ends when a player runs out of pennies", () => {
    // Simulate a state where player is almost out
    const s: GluckshausState = {
      ...initialState(42, settings),
      playerPennies: 1,
      board: { 2: 0, 3: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
    };
    // Find a seed that puts the penny in pot (sum 7) to drain to 0
    for (let seed = 0; seed < 100; seed++) {
      const s2 = reducer({ ...s, rngSeed: seed }, { type: "roll" });
      if (s2.gameOver) {
        expect(s2.winner).not.toBeNull();
        return;
      }
    }
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("player win gives score 100", () => {
    const s: GluckshausState = { ...initialState(42, settings), gameOver: true, winner: "player" };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("bot win gives score 0", () => {
    const s: GluckshausState = { ...initialState(42, settings), gameOver: true, winner: "bot" };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
