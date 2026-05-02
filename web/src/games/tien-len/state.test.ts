import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal, classifyPlay, beats } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("rankVal", () => {
  it("2 is highest (15)", () => expect(rankVal(2)).toBe(15));
  it("3 is lowest (3)", () => expect(rankVal(3)).toBe(3));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("Jack is 11", () => expect(rankVal(11)).toBe(11));
});

describe("classifyPlay", () => {
  it("single card => single", () => expect(classifyPlay([c(5)])).toBe("single"));
  it("pair same rank => pair", () => expect(classifyPlay([c(7, "♠"), c(7, "♥")])).toBe("pair"));
  it("four same rank => fourkind", () => expect(classifyPlay([c(9, "♠"), c(9, "♥"), c(9, "♦"), c(9, "♣")])).toBe("fourkind"));
  it("straight 3 consecutive => straight", () => expect(classifyPlay([c(3, "♠"), c(4, "♥"), c(5, "♦")])).toBe("straight"));
  it("mixed non-consecutive => null", () => expect(classifyPlay([c(3), c(5)])).toBeNull());
  it("straight with 2 is invalid", () => expect(classifyPlay([c(13), c(1), c(2, "♠")])).toBeNull());
});

describe("beats", () => {
  it("higher single beats lower", () => expect(beats([c(8)], [c(6)])).toBe(true));
  it("lower single does not beat higher", () => expect(beats([c(5)], [c(9)])).toBe(false));
  it("higher pair beats lower pair", () => expect(beats([c(8, "♠"), c(8, "♥")], [c(6, "♠"), c(6, "♥")])).toBe(true));
  it("four-of-a-kind beats pair of 2s", () => expect(beats([c(5, "♠"), c(5, "♥"), c(5, "♦"), c(5, "♣")], [c(2, "♠"), c(2, "♥")])).toBe(true));
  it("straight does not beat different-length straight", () => {
    const s3 = [c(3, "♠"), c(4, "♥"), c(5, "♦")];
    const s4 = [c(3, "♠"), c(4, "♥"), c(5, "♦"), c(6, "♣")];
    expect(beats(s4, s3)).toBe(false);
  });
});

describe("isLegalPlay", () => {
  it("any valid hand on empty pile is legal", () => expect(isLegalPlay([c(3)], null)).toBe(true));
  it("empty hand is not legal", () => expect(isLegalPlay([], null)).toBe(false));
  it("invalid hand type rejected", () => expect(isLegalPlay([c(3), c(5)], null)).toBe(false));
});

describe("initialState", () => {
  it("deals 13 each", () => {
    const s = initialState(2, settings);
    s.hands.forEach(h => expect(h.length).toBe(13));
  });
  it("deterministic", () => {
    expect(initialState(99, settings).hands).toEqual(initialState(99, settings).hands);
  });
  it("phase is playing", () => expect(initialState(1, settings).phase).toBe("playing"));
  it("52 total cards", () => {
    const s = initialState(2, settings);
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBe(52);
  });
});

describe("reducer", () => {
  it("no-op when game done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const };
    expect(reducer(s, { type: "pass" })).toBe(s);
  });
  it("invalid card ids are no-op", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: null };
    const s2 = reducer(s, { type: "play", cardIds: ["invalid-id"] });
    expect(s2).toBe(s);
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
  it("second place scores 60", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 0, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 60 });
  });
});
