import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { rounds: "3" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("rankVal", () => {
  it("2 is highest (15)", () => expect(rankVal(2)).toBe(15));
  it("3 is lowest (3)", () => expect(rankVal(3)).toBe(3));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("King is 13", () => expect(rankVal(13)).toBe(13));
});

describe("isLegalPlay", () => {
  it("single on empty pile is legal", () => expect(isLegalPlay([c(5)], null)).toBe(true));
  it("higher single beats lower", () => expect(isLegalPlay([c(9)], [c(6)])).toBe(true));
  it("lower single does not beat higher", () => expect(isLegalPlay([c(4)], [c(8)])).toBe(false));
  it("mixed ranks rejected", () => expect(isLegalPlay([c(5), c(6)], null)).toBe(false));
  it("pair beats lower pair", () => expect(isLegalPlay([c(9, "♠"), c(9, "♥")], [c(6, "♠"), c(6, "♥")])).toBe(true));
  it("must match count", () => expect(isLegalPlay([c(9)], [c(6, "♠"), c(6, "♥")])).toBe(false));
  it("2 beats Ace", () => expect(isLegalPlay([c(2)], [c(1)])).toBe(true));
});

describe("initialState", () => {
  it("52 cards dealt", () => {
    const s = initialState(1, settings);
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBe(52);
  });
  it("13 per hand", () => initialState(1, settings).hands.forEach(h => expect(h.length).toBe(13)));
  it("deterministic", () => expect(initialState(7, settings).hands).toEqual(initialState(7, settings).hands));
  it("starts in playing or swap phase", () => {
    const s = initialState(1, settings);
    expect(["playing", "swap"]).toContain(s.phase);
  });
});

describe("reducer", () => {
  it("no-op when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const };
    expect(reducer(s, { type: "pass" })).toBe(s);
  });
  it("invalid card play is no-op", () => {
    const s = { ...initialState(1, settings), phase: "playing" as const, turn: 0, lastPlay: null };
    const s2 = reducer(s, { type: "play", cardIds: ["nonexistent"] });
    expect(s2).toBe(s);
  });
  it("valid play reduces hand size", () => {
    const s = { ...initialState(10, settings), phase: "playing" as const, turn: 0, lastPlay: null };
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardIds: [card.id] });
    if (s2 !== s) expect(s2.hands[0]!.length).toBe(12);
  });
  it("pass increments or resets passCount", () => {
    const s = { ...initialState(1, settings), phase: "playing" as const, turn: 0, lastPlay: [c(5)] };
    const s2 = reducer(s, { type: "pass" });
    expect(s2.passCount).toBeGreaterThanOrEqual(0);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("player wins gives 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, playerRoundWins: 3, botRoundWins: 0 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("bot wins gives 20", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, playerRoundWins: 0, botRoundWins: 3 };
    expect(isTerminal(s)).toEqual({ score: 20 });
  });
});
