import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bragHandScore, rankVal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings3 = { rounds: "3" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("rankVal", () => {
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("King is 13", () => expect(rankVal(13)).toBe(13));
  it("3 is 3", () => expect(rankVal(3)).toBe(3));
  it("10 is 10", () => expect(rankVal(10)).toBe(10));
});

describe("bragHandScore", () => {
  it("prial > flush", () => {
    const prial = bragHandScore([c(7, "♠"), c(7, "♥"), c(7, "♦")]);
    const flush = bragHandScore([c(3, "♠"), c(7, "♠"), c(9, "♠")]);
    expect(prial).toBeGreaterThan(flush);
  });
  it("flush > straight", () => {
    const flush = bragHandScore([c(3, "♠"), c(7, "♠"), c(9, "♠")]);
    const straight = bragHandScore([c(3, "♠"), c(4, "♥"), c(5, "♦")]);
    expect(flush).toBeGreaterThan(straight);
  });
  it("straight > pair", () => {
    const straight = bragHandScore([c(3, "♠"), c(4, "♥"), c(5, "♦")]);
    const pair = bragHandScore([c(7, "♠"), c(7, "♥"), c(9, "♦")]);
    expect(straight).toBeGreaterThan(pair);
  });
  it("pair > high card", () => {
    const pair = bragHandScore([c(7, "♠"), c(7, "♥"), c(3, "♦")]);
    const high = bragHandScore([c(8, "♠"), c(10, "♥"), c(12, "♦")]);
    expect(pair).toBeGreaterThan(high);
  });
  it("prial of 3s scores 503", () => {
    const score = bragHandScore([c(3, "♠"), c(3, "♥"), c(3, "♦")]);
    expect(score).toBe(503);
  });
  it("prial of Aces scores 514", () => {
    const score = bragHandScore([c(1, "♠"), c(1, "♥"), c(1, "♦")]);
    expect(score).toBe(514);
  });
});

describe("initialState", () => {
  it("player gets 9 cards", () => expect(initialState(1, settings3).playerHand.length).toBe(9));
  it("bot gets 9 cards", () => expect(initialState(1, settings3).botHand.length).toBe(9));
  it("bot arrangement has 3 hands", () => expect(initialState(1, settings3).botArrangement.length).toBe(3));
  it("phase starts at arrange", () => expect(initialState(1, settings3).phase).toBe("arrange"));
  it("deterministic", () => {
    expect(initialState(42, settings3).playerHand).toEqual(initialState(42, settings3).playerHand);
  });
});

describe("reducer — arrange flow", () => {
  it("toggle selects a card", () => {
    const s = initialState(1, settings3);
    const s2 = reducer(s, { type: "toggleCard", index: 0 });
    expect(s2.selected).toContain(0);
  });
  it("toggle same card deselects", () => {
    const s = initialState(1, settings3);
    const s2 = reducer(reducer(s, { type: "toggleCard", index: 0 }), { type: "toggleCard", index: 0 });
    expect(s2.selected).not.toContain(0);
  });
  it("confirm with fewer than 3 is no-op", () => {
    const s = reducer(initialState(1, settings3), { type: "toggleCard", index: 0 });
    const s2 = reducer(s, { type: "confirmGroup" });
    expect(s2.currentGroup).toBe(0);
  });
  it("confirm with 3 advances group", () => {
    let s = initialState(1, settings3);
    s = reducer(s, { type: "toggleCard", index: 0 });
    s = reducer(s, { type: "toggleCard", index: 1 });
    s = reducer(s, { type: "toggleCard", index: 2 });
    s = reducer(s, { type: "confirmGroup" });
    expect(s.currentGroup).toBe(1);
    expect(s.playerArrangement?.length).toBe(1);
  });
});

describe("reducer — reveal", () => {
  function makeArrangedState() {
    let s = initialState(1, settings3);
    for (let g = 0; g < 3; g++) {
      for (let i = 0; i < 3; i++) s = reducer(s, { type: "toggleCard", index: g * 3 + i });
      s = reducer(s, { type: "confirmGroup" });
    }
    return s;
  }
  it("after 3 groups, reveal changes phase to reveal or done", () => {
    const s = reducer(makeArrangedState(), { type: "reveal" });
    expect(["reveal", "done"]).toContain(s.phase);
  });
  it("round result is set", () => {
    const s = reducer(makeArrangedState(), { type: "reveal" });
    expect(s.roundResult).not.toBe("");
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings3))).toBeNull());
  it("win gives 100", () => {
    const s = { ...initialState(1, settings3), phase: "done" as const, playerWins: 3, botWins: 1 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("loss gives 0", () => {
    const s = { ...initialState(1, settings3), phase: "done" as const, playerWins: 1, botWins: 3 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
