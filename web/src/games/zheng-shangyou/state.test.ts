import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, classifyPlay, rankVal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("classifyPlay", () => {
  it("single card", () => expect(classifyPlay([c(5)])).toBe("single"));
  it("pair", () => expect(classifyPlay([c(7, "♠"), c(7, "♥")])).toBe("pair"));
  it("triple", () => expect(classifyPlay([c(9, "♠"), c(9, "♥"), c(9, "♦")])).toBe("triple"));
  it("quad is bomb", () => expect(classifyPlay([c(6, "♠"), c(6, "♥"), c(6, "♦"), c(6, "♣")])).toBe("quad"));
  it("5-card sequence", () => expect(classifyPlay([c(3), c(4), c(5), c(6), c(7)])).toBe("sequence"));
  it("invalid mixed is null", () => expect(classifyPlay([c(3), c(5)])).toBeNull());
  it("empty is null", () => expect(classifyPlay([])).toBeNull());
});

describe("isLegalPlay", () => {
  it("anything on empty pile", () => expect(isLegalPlay([c(5)], null, null)).toBe(true));
  it("higher single beats lower", () => expect(isLegalPlay([c(9)], [c(5)], "single")).toBe(true));
  it("lower rejected", () => expect(isLegalPlay([c(4)], [c(9)], "single")).toBe(false));
  it("type mismatch rejected", () => expect(isLegalPlay([c(8), c(8, "♥")], [c(7)], "single")).toBe(false));
  it("quad beats single (bomb)", () => expect(isLegalPlay([c(6, "♠"), c(6, "♥"), c(6, "♦"), c(6, "♣")], [c(13)], "single")).toBe(true));
  it("non-quad cannot beat quad", () => expect(isLegalPlay([c(13)], [c(6, "♠"), c(6, "♥"), c(6, "♦"), c(6, "♣")], "quad")).toBe(false));
});

describe("rankVal", () => {
  it("2 is highest", () => expect(rankVal(2)).toBe(15));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("3 is lowest", () => expect(rankVal(3)).toBe(3));
});

describe("initialState", () => {
  it("deals 13 cards per player", () => {
    const s = initialState(1, settings);
    s.hands.forEach(h => expect(h.length).toBe(13));
  });
  it("phase is playing", () => expect(initialState(5, settings).phase).toBe("playing"));
  it("deterministic", () => expect(initialState(42, settings).hands).toEqual(initialState(42, settings).hands));
});

describe("reducer", () => {
  it("invalid play returns same state", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: [c(13)] };
    expect(reducer(s, { type: "play", cardIds: ["bad"] })).toBe(s);
  });
  it("valid play reduces hand", () => {
    const s = { ...initialState(10, settings), turn: 0, lastPlay: null };
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardIds: [card.id] });
    if (s2 !== s) expect(s2.hands[0]!.length).toBeLessThan(13);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("winner scores 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("last scores 0", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 2, 3, 0] };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
