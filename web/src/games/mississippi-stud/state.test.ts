import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcFinalPayout, visibleCommunity } from "./state.js";
import type { MississippiStudState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { anteSize: "10" as const, hands: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("MississippiStud initialState", () => {
  it("starts with bankroll 1000, ante phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.phase).toBe("ante");
    expect(s.bets).toEqual([]);
  });
});

describe("MississippiStud deal", () => {
  it("deal gives 2 player cards and 3 community cards, deducts ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("third-street");
    expect(s2.playerCards.length).toBe(2);
    expect(s2.communityCards.length).toBe(3);
    expect(s2.bankroll).toBe(990);
    expect(s2.bets).toEqual([10]);
  });
});

describe("MississippiStud betting streets", () => {
  it("betting 1x advances phase and deducts ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const s3 = reducer(s2, { type: "bet", multiplier: 1 });
    expect(s3.phase).toBe("fourth-street");
    expect(s3.bets).toEqual([10, 10]);
    expect(s3.bankroll).toBe(980);
  });

  it("three bets settle the hand", () => {
    const s = initialState(42, defaultSettings);
    let st = reducer(s, { type: "deal" });
    st = reducer(st, { type: "bet", multiplier: 1 });
    st = reducer(st, { type: "bet", multiplier: 1 });
    st = reducer(st, { type: "bet", multiplier: 1 });
    expect(st.phase).toBe("settled");
    expect(st.handsPlayed).toBe(1);
    expect(st.lastResult).toBeTruthy();
  });
});

describe("MississippiStud fold", () => {
  it("folding loses all placed bets", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });         // ante $10
    const s3 = reducer(s2, { type: "bet", multiplier: 2 }); // $20 more
    const s4 = reducer(s3, { type: "fold" });
    expect(s4.phase).toBe("settled");
    expect(s4.lastResult).toContain("Lost $30");
  });
});

describe("MississippiStud calcFinalPayout", () => {
  it("high-card loses (returns 0)", () => {
    const cards = [makeCard(2, "♠"), makeCard(5, "♥"), makeCard(8, "♦"), makeCard(11, "♣"), makeCard(13, "♥")];
    expect(calcFinalPayout(cards, 30)).toBe(0);
  });

  it("pair of jacks pays 1:1", () => {
    const cards = [makeCard(11), makeCard(11, "♥"), makeCard(2), makeCard(3), makeCard(5)];
    const payout = calcFinalPayout(cards, 30);
    expect(payout).toBe(60); // 30 back + 30 win
  });
});

describe("MississippiStud visibleCommunity", () => {
  it("shows correct count per phase", () => {
    expect(visibleCommunity("third-street")).toBe(0);
    expect(visibleCommunity("fourth-street")).toBe(1);
    expect(visibleCommunity("fifth-street")).toBe(2);
    expect(visibleCommunity("settled")).toBe(3);
  });
});

describe("MississippiStud terminal", () => {
  it("is terminal when hands reach limit", () => {
    const s = initialState(42, defaultSettings);
    const done: MississippiStudState = { ...s, phase: "settled", handsPlayed: 10, bankroll: 700 };
    expect(isTerminal(done)?.score).toBe(700);
  });
});
