import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, playerPits } from "./state.js";
import type { OwareState } from "./state.js";

describe("Oware", () => {
  it("initial state: 4 seeds per pit, player 0 to move", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.pits.every(p => p === 4)).toBe(true);
    expect(s.scores).toEqual([0, 0]);
  });

  it("playerPits returns correct indices", () => {
    expect(playerPits(0)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(playerPits(1)).toEqual([6, 7, 8, 9, 10, 11]);
  });

  it("sowing pit 0 distributes 4 seeds counterclockwise", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 0 });
    // Pit 0 should be empty
    expect(next.pits[0]).toBe(0);
    // Pits 1,2,3,4 each get +1 (from 4 to 5)
    expect(next.pits[1]).toBe(5);
    expect(next.pits[2]).toBe(5);
    expect(next.pits[3]).toBe(5);
    expect(next.pits[4]).toBe(5);
    // Turn should switch to 1 (or back to 0 after bot plays)
    // After bot plays, it's back to player's turn
    expect(next.turn).toBe(0);
  });

  it("rejects sowing empty pit", () => {
    const s = initialState(0, {});
    const emptyPits = [...s.pits];
    emptyPits[0] = 0;
    const emptyState: OwareState = { ...s, pits: emptyPits };
    const next = reducer(emptyState, { type: "sow", pit: 0 });
    expect(next).toBe(emptyState);
  });

  it("rejects sowing opponent pit", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 6 }); // pit 6 is bot's
    expect(next).toBe(s);
  });

  it("game ends when a side is empty after sowing", () => {
    // Player has only pit 0 with seeds, all others empty
    // After sowing, player side is empty → game over
    const pits = new Array(12).fill(0) as number[];
    pits[0] = 1; // only pit 0 has seed
    // Bot side has seeds
    pits[7] = 3;
    // After sowing pit 0: seed goes to pit 1, player side pits 0-5 = [0,1,0,0,0,0]
    // Player side not empty yet (pit 1 got a seed), bot plays then...
    // Let's make a state where player has ONE total seed and after sowing it's all zero
    // Pit 0 = 1, land on pit 1 (which already has 0). Player side: [0,1,0,0,0,0]. Not empty.
    // To get empty: set all player pits to 0 except one pit with 1 seed that lands on bot side only
    // Use pit 5 (last player pit): sow 1 seed → goes to pit 6 (bot side). Player side becomes empty.
    const pits2 = new Array(12).fill(0) as number[];
    pits2[5] = 1; // last player pit
    pits2[6] = 3; // bot has seeds
    const s: OwareState = { pits: pits2, scores: [20, 15], turn: 0, winner: null, rngSeed: 0, settings: {}, lastSowed: null };
    const next = reducer(s, { type: "sow", pit: 5 });
    // After sowing pit 5: seed lands on pit 6 (bot side). Player side [0..5] all empty → game over
    expect(next.winner).not.toBeNull();
  });

  it("isTerminal: score 100 for win, 0 for loss, 50 for draw", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
    expect(isTerminal({ ...s, winner: "draw" })).toEqual({ score: 50 });
  });
});
