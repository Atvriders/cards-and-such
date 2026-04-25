import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlay } from "./state.js";
import type { KarmaState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("starts in swap phase", () => {
    expect(initialState(1, s2).phase).toBe("swap");
  });

  it("each player has 3 hand + 3 up + 3 down", () => {
    const s = initialState(1, s2);
    expect(s.players[0]!.hand.length).toBe(3);
    expect(s.players[0]!.tableUp.length).toBe(3);
    expect(s.players[0]!.tableDown.length).toBe(3);
  });

  it("is deterministic", () => {
    const a = initialState(42, s2);
    const b = initialState(42, s2);
    expect(a.players[0]!.hand).toEqual(b.players[0]!.hand);
  });
});

describe("reducer — swap phase", () => {
  it("swapping two cards exchanges them", () => {
    const s = initialState(5, s2);
    const handCard = s.players[0]!.hand[0]!;
    const tableCard = s.players[0]!.tableUp[0]!;
    const s2s = reducer(s, { type: "swapCard", handId: handCard.id, tableId: tableCard.id });
    expect(s2s.players[0]!.hand.some(c => c.id === tableCard.id)).toBe(true);
    expect(s2s.players[0]!.tableUp.some(c => c.id === handCard.id)).toBe(true);
  });

  it("confirming swap moves to playing phase", () => {
    const s = initialState(1, s2);
    const s2s = reducer(s, { type: "confirmSwap" });
    expect(s2s.phase).toBe("playing");
  });

  it("rejecting bogus swap ids returns unchanged state", () => {
    const s = initialState(1, s2);
    const result = reducer(s, { type: "swapCard", handId: "bogus", tableId: "bogus2" });
    expect(result).toBe(s);
  });
});

describe("canPlay", () => {
  const emptyPile: Card[] = [];

  it("2 plays on anything", () => {
    const bigCard = { rank: 13 as const, suit: "♠" as const, id: "K" };
    const two = { rank: 2 as const, suit: "♠" as const, id: "2" };
    expect(canPlay(two, [bigCard])).toBe(true);
  });

  it("10 plays on anything", () => {
    const bigCard = { rank: 13 as const, suit: "♠" as const, id: "K" };
    const ten = { rank: 10 as const, suit: "♠" as const, id: "10" };
    expect(canPlay(ten, [bigCard])).toBe(true);
  });

  it("lower rank cannot play on higher rank", () => {
    const king = card(13);
    const three = card(3);
    expect(canPlay(three, [king])).toBe(false);
  });

  it("any card plays on empty pile", () => {
    expect(canPlay(card(5), emptyPile)).toBe(true);
  });
});

describe("reducer — playing phase", () => {
  it("playing a card removes it from hand", () => {
    const base = initialState(1, s2);
    const playing: KarmaState = { ...base, phase: "playing" };
    const c = playing.players[0]!.hand[0]!;
    const result = reducer(playing, { type: "playCards", cardIds: [c.id] });
    expect(result.players[0]!.hand.some(x => x.id === c.id)).toBe(false);
  });

  it("pick up pile adds to hand", () => {
    const base = initialState(1, s2);
    const pileCard = card(9);
    const playing: KarmaState = { ...base, phase: "playing", discardPile: [pileCard] };
    const result = reducer(playing, { type: "pickUpPile" });
    expect(result.players[0]!.hand.some(c => c.id === pileCard.id)).toBe(true);
    expect(result.discardPile.length).toBe(0);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns 500 for player win", () => {
    const s = initialState(1, s2);
    const won: KarmaState = { ...s, phase: "done", winner: 0 };
    expect(isTerminal(won)!.score).toBe(500);
  });

  it("returns 50 for player loss", () => {
    const s = initialState(1, s2);
    const lost: KarmaState = { ...s, phase: "done", winner: 1 };
    expect(isTerminal(lost)!.score).toBe(50);
  });
});
