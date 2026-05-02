import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal, handType, fiveCardScore } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("rankVal", () => {
  it("2 is 15", () => expect(rankVal(2)).toBe(15));
  it("3 is 3", () => expect(rankVal(3)).toBe(3));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("10 is 10", () => expect(rankVal(10)).toBe(10));
});

describe("handType", () => {
  it("single", () => expect(handType([c(5)])).toBe("single"));
  it("pair", () => expect(handType([c(7, "♠"), c(7, "♥")])).toBe("pair"));
  it("triple", () => expect(handType([c(9, "♠"), c(9, "♥"), c(9, "♦")])).toBe("triple"));
  it("straight is fivecard", () => expect(handType([c(3, "♠"), c(4, "♥"), c(5, "♦"), c(6, "♣"), c(7, "♠")])).toBe("fivecard"));
  it("mixed 2 cards is null", () => expect(handType([c(3), c(5)])).toBeNull());
});

describe("fiveCardScore", () => {
  it("straight flush > four-of-a-kind", () => {
    const sf = fiveCardScore([c(3, "♠"), c(4, "♠"), c(5, "♠"), c(6, "♠"), c(7, "♠")]);
    const foak = fiveCardScore([c(9, "♠"), c(9, "♥"), c(9, "♦"), c(9, "♣"), c(5, "♠")]);
    expect(sf).toBeGreaterThan(foak);
  });
  it("flush > straight", () => {
    const flush = fiveCardScore([c(3, "♠"), c(5, "♠"), c(7, "♠"), c(9, "♠"), c(11, "♠")]);
    const straight = fiveCardScore([c(3, "♠"), c(4, "♥"), c(5, "♦"), c(6, "♣"), c(7, "♠")]);
    expect(flush).toBeGreaterThan(straight);
  });
});

describe("isLegalPlay", () => {
  it("any single on empty is legal", () => expect(isLegalPlay([c(5)], null)).toBe(true));
  it("lower single doesn't beat higher", () => expect(isLegalPlay([c(4)], [c(8)])).toBe(false));
  it("pair beats lower pair", () => expect(isLegalPlay([c(9, "♠"), c(9, "♥")], [c(7, "♠"), c(7, "♥")])).toBe(true));
  it("empty is illegal", () => expect(isLegalPlay([], null)).toBe(false));
});

describe("initialState", () => {
  it("52 cards dealt", () => {
    const s = initialState(9, settings);
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBe(52);
  });
  it("phase playing", () => expect(initialState(1, settings).phase).toBe("playing"));
  it("deterministic", () => expect(initialState(7, settings).hands).toEqual(initialState(7, settings).hands));
  it("13 per hand", () => initialState(9, settings).hands.forEach(h => expect(h.length).toBe(13)));
});

describe("reducer", () => {
  it("no-op when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const };
    expect(reducer(s, { type: "pass" })).toBe(s);
  });
  it("invalid play is no-op", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: null };
    const s2 = reducer(s, { type: "play", cardIds: ["xxx"] });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("winner scores >= 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3], score: 45 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });
  it("loser scores 0", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 2, 3, 0], score: 0 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
  it("second place scores 60", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 0, 2, 3], score: 0 };
    expect(isTerminal(s)).toEqual({ score: 60 });
  });
});
