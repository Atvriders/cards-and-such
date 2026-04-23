import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, BOARD_SIZE, PATH_COLORS, GUMDROP_PASS, GLOPPYS_SWAMP } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Candy Land", () => {
  it("initializes with all players at position 0", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    expect(s.positions).toEqual([0, 0]);
    expect(s.winner).toBeNull();
    expect(s.turn).toBe(0);
  });

  it("drawing a card advances player 0", () => {
    const s = initialState(42, s1);
    const next = reducer(s, { type: "draw" });
    expect(next.positions[0]).toBeGreaterThan(0);
    expect(next.lastCard).not.toBeNull();
  });

  it("path colors follow the 6-color cycle", () => {
    const cycle = ["red", "orange", "yellow", "green", "blue", "purple"];
    for (let i = 0; i < BOARD_SIZE; i++) {
      expect(PATH_COLORS[i]).toBe(cycle[i % 6]);
    }
  });

  it("winner is detected when passing position 50", () => {
    // Force win by placing player near end
    const s = initialState(42, s1);
    const setup = { ...s, positions: [49, 0] };
    // Run multiple draws until win (positions can only go up or teleport)
    let cur = setup;
    for (let i = 0; i < 50; i++) {
      if (cur.winner !== null) break;
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.winner).not.toBeNull();
  });

  it("gumdrop-pass destination is correct", () => {
    expect(GUMDROP_PASS).toBe(12);
  });

  it("gloppy's swamp destination is correct", () => {
    expect(GLOPPYS_SWAMP).toBe(28);
  });

  it("isTerminal returns null when game is ongoing", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 when player 0 wins", () => {
    const s = initialState(42, s1);
    const won = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("isTerminal returns score 0 when bot wins", () => {
    const s = initialState(42, s1);
    const lost = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("bot advances during player turn resolution", () => {
    const s = initialState(42, s1);
    const next = reducer(s, { type: "draw" });
    // After player draws, bots take turns; final turn should be 0
    expect(next.turn).toBe(0);
  });
});
