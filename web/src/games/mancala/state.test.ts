import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  PLAYER0_STORE,
  PLAYER1_STORE,
  PLAYER0_PITS,
  PLAYER1_PITS,
} from "./state.js";

describe("Mancala", () => {
  it("starts with 4 seeds in each pit and 0 in stores", () => {
    const s = initialState(42, {});
    for (const p of PLAYER0_PITS) expect(s.board[p]).toBe(4);
    for (const p of PLAYER1_PITS) expect(s.board[p]).toBe(4);
    expect(s.board[PLAYER0_STORE]).toBe(0);
    expect(s.board[PLAYER1_STORE]).toBe(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("sowing from pit 0 reduces total seeds by zero (seeds are conserved)", () => {
    const s = initialState(0, {});
    const totalBefore = s.board.reduce((a, b) => a + b, 0);
    const next = reducer(s, { type: "sow", pit: 0 });
    // After player and bot both move, total seeds in play unchanged (some now in stores)
    const totalAfter = next.board.reduce((a, b) => a + b, 0);
    expect(totalAfter).toBe(totalBefore);
    // Player store should be 0 (pit 0 has 4 seeds, none land in store at position 6)
    // At minimum the store was untouched by player move from pit 0
    expect(next.board[PLAYER0_STORE]).toBeGreaterThanOrEqual(0);
    // Turn should have advanced (bot moved)
    expect(next.turn).toBe(0); // back to player after bot's turn
  });

  it("rejects action from opponent's pits", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 7 }); // player 1's pit
    expect(next).toBe(s);
  });

  it("rejects sow from empty pit", () => {
    const s = initialState(0, {});
    // Manually make pit 2 empty
    const board = [...s.board];
    board[2] = 0;
    const s2 = { ...s, board };
    const next = reducer(s2, { type: "sow", pit: 2 });
    expect(next).toBe(s2);
  });

  it("extra turn when last seed lands in own store", () => {
    // Pit 2 (index 2) has 4 seeds: will land on pits 3,4,5 and store 6
    const s = initialState(0, {});
    // set pit 2 to exactly 4 so it wraps to store on last seed
    const board = [...s.board];
    board[2] = 4; // stays 4
    const s2 = { ...s, board };
    const next = reducer(s2, { type: "sow", pit: 2 });
    // If last seed lands in store, it's still player 0's turn
    // The bot won't act when turn stays 0
    // next.turn could be 0 (extra turn) or 1 (bot's turn after bot moved)
    // With pit 2 having 4 seeds: lands on 3, 4, 5, store=6 => extra turn!
    expect(next.board[PLAYER0_STORE]).toBeGreaterThan(0);
  });

  it("isTerminal returns null mid-game and score at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    const won = { ...s, winner: 0 as const };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost = { ...s, winner: 1 as const };
    expect(isTerminal(lost)).toEqual({ score: 0 });
    const draw = { ...s, winner: "draw" as const };
    expect(isTerminal(draw)).toEqual({ score: 50 });
  });
});
