import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isValidBoard, scoreBoards, rankTop3 } from "./state.js";

const S = { rounds: "1" as const };

describe("Open-Face Chinese Poker", () => {
  it("starts in placing phase with no cards dealt", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("placing");
    expect(s.hand).toHaveLength(0);
  });

  it("deal gives player 13 cards", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.hand).toHaveLength(13);
    expect(s.cpu.top.length + s.cpu.middle.length + s.cpu.bottom.length).toBe(13);
  });

  it("rankTop3 detects pair", () => {
    const r = rankTop3([
      { suit: "♠" as const, rank: 13 as const, id: "a" },
      { suit: "♥" as const, rank: 13 as const, id: "b" },
      { suit: "♦" as const, rank: 5 as const, id: "c" },
    ]);
    expect(r.class).toBe("pair");
  });

  it("isValidBoard rejects bottom < middle", () => {
    const board = {
      top: [
        { suit: "♠" as const, rank: 2 as const, id: "1" },
        { suit: "♥" as const, rank: 3 as const, id: "2" },
        { suit: "♦" as const, rank: 4 as const, id: "3" },
      ],
      middle: [
        { suit: "♠" as const, rank: 13 as const, id: "4" },
        { suit: "♥" as const, rank: 13 as const, id: "5" },
        { suit: "♦" as const, rank: 13 as const, id: "6" },
        { suit: "♣" as const, rank: 13 as const, id: "7" },
        { suit: "♠" as const, rank: 12 as const, id: "8" },
      ],
      bottom: [
        { suit: "♠" as const, rank: 5 as const, id: "9" },
        { suit: "♥" as const, rank: 6 as const, id: "10" },
        { suit: "♦" as const, rank: 7 as const, id: "11" },
        { suit: "♣" as const, rank: 8 as const, id: "12" },
        { suit: "♠" as const, rank: 11 as const, id: "13" },
      ],
    };
    expect(isValidBoard(board)).toBe(false);
  });

  it("scoreBoards returns positive when player wins all rows", () => {
    // Player: top pair 9s, middle two pair, bottom full house — valid (bottom > middle > top)
    const player = {
      top: [
        { suit: "♠" as const, rank: 9 as const, id: "1" },
        { suit: "♥" as const, rank: 9 as const, id: "2" },
        { suit: "♦" as const, rank: 5 as const, id: "3" },
      ],
      middle: [
        { suit: "♠" as const, rank: 11 as const, id: "4" },
        { suit: "♥" as const, rank: 11 as const, id: "5" },
        { suit: "♦" as const, rank: 8 as const, id: "6" },
        { suit: "♣" as const, rank: 8 as const, id: "7" },
        { suit: "♠" as const, rank: 2 as const, id: "8" },
      ],
      bottom: [
        { suit: "♥" as const, rank: 13 as const, id: "9" },
        { suit: "♦" as const, rank: 13 as const, id: "10" },
        { suit: "♣" as const, rank: 13 as const, id: "11" },
        { suit: "♥" as const, rank: 12 as const, id: "12" },
        { suit: "♦" as const, rank: 12 as const, id: "13" },
      ],
    };
    // CPU: top high card, middle pair 4s, bottom pair 6s — valid, all weaker
    const cpu = {
      top: [
        { suit: "♣" as const, rank: 2 as const, id: "1" },
        { suit: "♥" as const, rank: 3 as const, id: "2" },
        { suit: "♦" as const, rank: 4 as const, id: "3" },
      ],
      middle: [
        { suit: "♣" as const, rank: 4 as const, id: "4" },
        { suit: "♥" as const, rank: 4 as const, id: "5" },
        { suit: "♠" as const, rank: 7 as const, id: "6" },
        { suit: "♣" as const, rank: 11 as const, id: "7" },
        { suit: "♥" as const, rank: 12 as const, id: "8" },
      ],
      bottom: [
        { suit: "♥" as const, rank: 6 as const, id: "9" },
        { suit: "♦" as const, rank: 6 as const, id: "10" },
        { suit: "♠" as const, rank: 8 as const, id: "11" },
        { suit: "♣" as const, rank: 10 as const, id: "12" },
        { suit: "♥" as const, rank: 7 as const, id: "13" },
      ],
    };
    const score = scoreBoards(player, cpu);
    expect(score).toBeGreaterThan(0);
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("placing all cards in one round ends the game (rounds=1)", () => {
    let s = reducer(initialState(3, S), { type: "deal" });
    let safety = 50;
    while (s.cardIdx < s.hand.length && safety-- > 0) {
      // Try bottom first, then middle, then top
      if (s.player.bottom.length < 5) s = reducer(s, { type: "place", row: "bottom" });
      else if (s.player.middle.length < 5) s = reducer(s, { type: "place", row: "middle" });
      else s = reducer(s, { type: "place", row: "top" });
    }
    expect(s.phase === "scored" || s.phase === "done").toBe(true);
  });
});
