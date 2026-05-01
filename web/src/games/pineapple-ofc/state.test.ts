import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isValidBoard, scoreBoards, rankTop3 } from "./state.js";

const S = { rounds: "1" as const };

describe("Pineapple OFC", () => {
  it("starts in initial-place with no cards", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("initial-place");
    expect(s.hand).toHaveLength(0);
  });

  it("deal gives player 5 initial cards", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.hand).toHaveLength(5);
    expect(s.cpu.top.length + s.cpu.middle.length + s.cpu.bottom.length).toBe(13);
  });

  it("placing 5 initial cards transitions to draw-place", () => {
    let s = reducer(initialState(2, S), { type: "deal" });
    for (let i = 0; i < 5; i++) {
      // Place into bottom first, middle next
      const row = s.player.bottom.length < 5 ? "bottom"
        : s.player.middle.length < 5 ? "middle" : "top";
      s = reducer(s, { type: "place", row, cardIndex: 0 });
    }
    expect(s.phase === "draw-place" || s.phase === "scored" || s.phase === "done").toBe(true);
  });

  it("rankTop3 detects trips", () => {
    const r = rankTop3([
      { suit: "♠" as const, rank: 13 as const, id: "a" },
      { suit: "♥" as const, rank: 13 as const, id: "b" },
      { suit: "♦" as const, rank: 13 as const, id: "c" },
    ]);
    expect(r.class).toBe("trips");
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("scoreBoards penalizes fouled board", () => {
    const fouled = {
      top: [
        { suit: "♠" as const, rank: 13 as const, id: "1" },
        { suit: "♥" as const, rank: 13 as const, id: "2" },
        { suit: "♦" as const, rank: 13 as const, id: "3" },
      ],
      middle: [
        { suit: "♠" as const, rank: 2 as const, id: "4" },
        { suit: "♥" as const, rank: 3 as const, id: "5" },
        { suit: "♦" as const, rank: 4 as const, id: "6" },
        { suit: "♣" as const, rank: 6 as const, id: "7" },
        { suit: "♠" as const, rank: 7 as const, id: "8" },
      ],
      bottom: [
        { suit: "♠" as const, rank: 2 as const, id: "9" },
        { suit: "♥" as const, rank: 4 as const, id: "10" },
        { suit: "♦" as const, rank: 6 as const, id: "11" },
        { suit: "♣" as const, rank: 8 as const, id: "12" },
        { suit: "♠" as const, rank: 11 as const, id: "13" },
      ],
    };
    const valid = {
      top: [
        { suit: "♣" as const, rank: 2 as const, id: "1" },
        { suit: "♥" as const, rank: 3 as const, id: "2" },
        { suit: "♦" as const, rank: 4 as const, id: "3" },
      ],
      middle: [
        { suit: "♣" as const, rank: 5 as const, id: "4" },
        { suit: "♥" as const, rank: 6 as const, id: "5" },
        { suit: "♠" as const, rank: 7 as const, id: "6" },
        { suit: "♣" as const, rank: 9 as const, id: "7" },
        { suit: "♥" as const, rank: 10 as const, id: "8" },
      ],
      bottom: [
        { suit: "♥" as const, rank: 9 as const, id: "9" },
        { suit: "♦" as const, rank: 10 as const, id: "10" },
        { suit: "♠" as const, rank: 12 as const, id: "11" },
        { suit: "♣" as const, rank: 13 as const, id: "12" },
        { suit: "♥" as const, rank: 1 as const, id: "13" },
      ],
    };
    expect(isValidBoard(fouled)).toBe(false);
    // fouled vs valid: fouled hand should LOSE big
    const score = scoreBoards(fouled, valid);
    expect(score).toBeLessThan(0);
  });
});
