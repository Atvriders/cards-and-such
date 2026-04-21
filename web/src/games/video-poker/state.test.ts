import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateHand } from "./state.js";
import type { VideoPokerState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = {
  betSize: "1" as const,
  paytable: "9/6" as const,
  handsPerSession: 50,
};

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("Video Poker initialState", () => {
  it("has credits=100, phase=deal", () => {
    const s = initialState(42, defaultSettings);
    expect(s.credits).toBe(100);
    expect(s.phase).toBe("deal");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("Video Poker deal action", () => {
  it("deals 5 cards and decrements credits by betSize", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("hold");
    expect(s2.hand.length).toBe(5);
    expect(s2.credits).toBe(99); // 100 - 1
  });

  it("does not deal if credits are 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: VideoPokerState = { ...s, credits: 0 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("deal");
  });
});

describe("Video Poker toggleHold", () => {
  it("toggleHold flips a card's held flag", () => {
    const s = initialState(42, defaultSettings);
    const dealt = reducer(s, { type: "deal" });
    expect(dealt.hand[0]!.held).toBe(false);
    const held = reducer(dealt, { type: "toggleHold", index: 0 });
    expect(held.hand[0]!.held).toBe(true);
    const unheld = reducer(held, { type: "toggleHold", index: 0 });
    expect(unheld.hand[0]!.held).toBe(false);
  });

  it("toggleHold does nothing outside hold phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toggleHold", index: 0 });
    expect(s2).toEqual(s);
  });
});

describe("Video Poker draw action", () => {
  it("replaces non-held cards", () => {
    const s = initialState(42, defaultSettings);
    const dealt = reducer(s, { type: "deal" });
    // Hold first two cards
    const h1 = reducer(dealt, { type: "toggleHold", index: 0 });
    const h2 = reducer(h1, { type: "toggleHold", index: 1 });
    const heldCard0 = h2.hand[0]!.card;
    const heldCard1 = h2.hand[1]!.card;

    const drawn = reducer(h2, { type: "draw" });
    expect(drawn.phase).toBe("shown");
    expect(drawn.hand.length).toBe(5);
    // Held cards should be the same
    expect(drawn.hand[0]!.card).toEqual(heldCard0);
    expect(drawn.hand[1]!.card).toEqual(heldCard1);
    // handsPlayed incremented
    expect(drawn.handsPlayed).toBe(1);
  });
});

describe("Video Poker payouts", () => {
  it("pair of Jacks pays 1 * betSize", () => {
    const hand = [
      makeCard(11, "♠"),
      makeCard(11, "♥"),
      makeCard(2, "♦"),
      makeCard(5, "♣"),
      makeCard(8, "♠"),
    ];
    const result = evaluateHand(hand, "9/6");
    expect(result.name).toBe("Jacks or Better");
    expect(result.multiplier).toBe(1);
  });

  it("royal flush pays 800", () => {
    const hand = [
      makeCard(1, "♠"),
      makeCard(10, "♠"),
      makeCard(11, "♠"),
      makeCard(12, "♠"),
      makeCard(13, "♠"),
    ];
    const result = evaluateHand(hand, "9/6");
    expect(result.name).toBe("Royal Flush");
    expect(result.multiplier).toBe(800);
  });
});

describe("Video Poker terminal condition", () => {
  it("is terminal when credits <= 0", () => {
    const s = initialState(42, defaultSettings);
    const state: VideoPokerState = { ...s, credits: 0, phase: "shown" };
    const result = isTerminal(state);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(0);
  });

  it("is terminal when handsPlayed >= handsPerSession", () => {
    const s = initialState(42, defaultSettings);
    const state: VideoPokerState = { ...s, handsPlayed: 50, credits: 75, phase: "shown" };
    const result = isTerminal(state);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(75);
  });

  it("is not terminal in early game", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});

describe("Video Poker paytable settings", () => {
  it("9/6 paytable gives full house multiplier of 9", () => {
    const hand = [
      makeCard(7, "♠"),
      makeCard(7, "♥"),
      makeCard(7, "♦"),
      makeCard(3, "♣"),
      makeCard(3, "♠"),
    ];
    const result96 = evaluateHand(hand, "9/6");
    expect(result96.name).toBe("Full House");
    expect(result96.multiplier).toBe(9);
  });

  it("8/5 paytable gives full house multiplier of 8", () => {
    const hand = [
      makeCard(7, "♠"),
      makeCard(7, "♥"),
      makeCard(7, "♦"),
      makeCard(3, "♣"),
      makeCard(3, "♠"),
    ];
    const result85 = evaluateHand(hand, "8/5");
    expect(result85.name).toBe("Full House");
    expect(result85.multiplier).toBe(8);
  });
});
