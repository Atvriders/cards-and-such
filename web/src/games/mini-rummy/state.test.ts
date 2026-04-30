import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestMelds, deadwoodPoints, HAND_SIZE } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const S = { dummy: false };

describe("MiniRummy", () => {
  it("starts with HAND_SIZE cards each, draw phase, player turn", () => {
    const s = initialState(1, S);
    expect(s.player.length).toBe(HAND_SIZE);
    expect(s.cpu.length).toBe(HAND_SIZE);
    expect(s.phase).toBe("draw");
    expect(s.turn).toBe("player");
  });

  it("drawDeck adds a card and moves to discard phase", () => {
    const s = reducer(initialState(2, S), { type: "drawDeck" });
    expect(s.player.length).toBe(HAND_SIZE + 1);
    expect(s.phase).toBe("discard");
  });

  it("bestMelds finds a set of 3", () => {
    const hand: Card[] = [
      { suit: "♠", rank: 5, id: "1" },
      { suit: "♥", rank: 5, id: "2" },
      { suit: "♦", rank: 5, id: "3" },
      { suit: "♣", rank: 9, id: "4" },
    ];
    const { melds, deadwood } = bestMelds(hand);
    expect(melds.length).toBe(1);
    expect(melds[0]!.length).toBe(3);
    expect(deadwood.length).toBe(1);
  });

  it("bestMelds finds a run of 3", () => {
    const hand: Card[] = [
      { suit: "♠", rank: 5, id: "1" },
      { suit: "♠", rank: 6, id: "2" },
      { suit: "♠", rank: 7, id: "3" },
    ];
    const { melds, deadwood } = bestMelds(hand);
    expect(melds.length).toBe(1);
    expect(deadwood.length).toBe(0);
  });

  it("deadwoodPoints: face cards = 10, ace = 1", () => {
    const cards: Card[] = [
      { suit: "♠", rank: 11, id: "j" },
      { suit: "♥", rank: 1, id: "a" },
      { suit: "♦", rank: 7, id: "7" },
    ];
    expect(deadwoodPoints(cards)).toBe(10 + 1 + 7);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("CPU plays a turn and game progresses", () => {
    let s = initialState(5, S);
    s = reducer(s, { type: "drawDeck" });
    s = reducer(s, { type: "select", id: s.player[0]!.id });
    s = reducer(s, { type: "discard" });
    expect(["cpuTurn", "done"]).toContain(s.phase);
    if (s.phase === "cpuTurn") {
      s = reducer(s, { type: "cpuPlay" });
      expect(["draw", "done"]).toContain(s.phase);
    }
  });
});
