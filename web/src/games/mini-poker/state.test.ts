import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankHand, compareHands, ANTE, STARTING_BANKROLL } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const S = { dummy: false };

function mc(suit: Card["suit"], rank: Card["rank"], id: string): Card {
  return { suit, rank, id };
}

describe("MiniPoker", () => {
  it("starts in ante phase with starting bankroll", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("ante");
    expect(s.bankroll).toBe(STARTING_BANKROLL);
  });

  it("deal moves to draw with 5-card hands and pot = 2*ANTE", () => {
    const s = reducer(initialState(7, S), { type: "deal" });
    expect(s.phase).toBe("draw");
    expect(s.player.length).toBe(5);
    expect(s.cpu.length).toBe(5);
    expect(s.pot).toBe(ANTE * 2);
  });

  it("rankHand recognizes royal flush", () => {
    const hand: Card[] = [
      mc("♠", 1, "1"),
      mc("♠", 13, "k"),
      mc("♠", 12, "q"),
      mc("♠", 11, "j"),
      mc("♠", 10, "t"),
    ];
    const r = rankHand(hand);
    expect(r.rank).toBe(8);
    expect(r.name).toBe("Straight Flush");
  });

  it("rankHand recognizes four of a kind", () => {
    const hand: Card[] = [
      mc("♠", 7, "1"),
      mc("♥", 7, "2"),
      mc("♦", 7, "3"),
      mc("♣", 7, "4"),
      mc("♠", 2, "5"),
    ];
    expect(rankHand(hand).rank).toBe(7);
  });

  it("rankHand recognizes pair", () => {
    const hand: Card[] = [
      mc("♠", 5, "1"),
      mc("♥", 5, "2"),
      mc("♦", 8, "3"),
      mc("♣", 9, "4"),
      mc("♠", 13, "5"),
    ];
    expect(rankHand(hand).rank).toBe(1);
  });

  it("compareHands: full house beats flush", () => {
    const fullHouse: Card[] = [
      mc("♠", 7, "1"), mc("♥", 7, "2"), mc("♦", 7, "3"),
      mc("♣", 4, "4"), mc("♠", 4, "5"),
    ];
    const flush: Card[] = [
      mc("♠", 2, "1"), mc("♠", 5, "2"), mc("♠", 9, "3"),
      mc("♠", 11, "4"), mc("♠", 13, "5"),
    ];
    expect(compareHands(fullHouse, flush)).toBeGreaterThan(0);
  });

  it("toggle adds/removes card from selected", () => {
    let s = reducer(initialState(11, S), { type: "deal" });
    const id = s.player[0]!.id;
    s = reducer(s, { type: "toggle", cardId: id });
    expect(s.selected).toContain(id);
    s = reducer(s, { type: "toggle", cardId: id });
    expect(s.selected).not.toContain(id);
  });

  it("draw moves to showdown with same number of cards", () => {
    let s = reducer(initialState(13, S), { type: "deal" });
    s = reducer(s, { type: "toggle", cardId: s.player[0]!.id });
    s = reducer(s, { type: "draw" });
    expect(s.phase).toBe("showdown");
    expect(s.player.length).toBe(5);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
