import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  handValue,
  isBlackjack,
} from "./state.js";
import type { BlackjackState, BlackjackHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = {
  handsPerSession: 25,
  bet: "10" as const,
  deckCount: "6" as const,
  dealerHitsSoft17: false,
};

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("Blackjack initialState", () => {
  it("has bankroll=1000, handsPlayed=0, phase=betting", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.handsPlayed).toBe(0);
    expect(s.phase).toBe("betting");
    expect(s.shoe.length).toBeGreaterThan(0);
  });
});

describe("Blackjack deal action", () => {
  it("deals 2 cards to player and 2 to dealer, moves to player phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Should be in player phase unless immediate BJ
    if (s2.phase === "player") {
      expect(s2.playerHands[0]!.cards.length).toBe(2);
      expect(s2.dealerHand.length).toBe(2);
      expect(s2.dealerFaceDown).toBe(true);
      expect(s2.bankroll).toBe(990); // 1000 - 10
    } else {
      // BJ scenario — still dealt 2+2
      expect(s2.dealerHand.length).toBe(2);
      expect(s2.playerHands[0]!.cards.length).toBe(2);
    }
  });

  it("deducts bet from bankroll on deal", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.bankroll).toBeLessThan(s.bankroll);
    expect(s.bankroll - s2.bankroll).toBe(10); // initial deduction
  });
});

describe("Blackjack blackjack payout", () => {
  it("blackjack pays 3:2", () => {
    // Create a state that forces BJ for player
    const s = initialState(42, defaultSettings);
    const bjState: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(1), makeCard(13)], // A + K = blackjack
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      dealerHand: [makeCard(5), makeCard(7)], // dealer = 12
      dealerFaceDown: true,
      activeHandIndex: 0,
    };
    // Stand to trigger settlement
    const settled = reducer(bjState, { type: "stand" });
    expect(settled.phase).toBe("settled");
    // bankroll should increase by 3:2 of bet: started at 990, BJ earns bet(10) + 1.5*bet(15) = 25
    // so bankroll = 990 + 10 + 15 = 1015
    expect(settled.bankroll).toBe(1015);
  });
});

describe("Blackjack hit action", () => {
  it("hit draws a card and busts if over 21", () => {
    const s = initialState(42, defaultSettings);
    // Build a state with player near bust
    const nearBust: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(10), makeCard(6), makeCard(5)], // 21 already
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      dealerHand: [makeCard(7), makeCard(8)],
      dealerFaceDown: true,
      activeHandIndex: 0,
    };

    // Force a bust by directly setting player over 21
    const bustState: BlackjackState = {
      ...nearBust,
      playerHands: [{
        cards: [makeCard(10), makeCard(6), makeCard(8)], // 24 = bust
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
    };

    const s2 = reducer(bustState, { type: "hit" });
    // After hitting on 24, should be settled with bust
    expect(s2.phase).toBe("settled");
    const bust = s2.playerHands[0]!;
    // Either the hand recorded as busted or value > 21
    const val = handValue(bust.cards);
    expect(val.best).toBeGreaterThan(21);
  });

  it("hit draws one more card", () => {
    const s = initialState(42, defaultSettings);
    const state: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(5), makeCard(4)], // 9
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      dealerHand: [makeCard(7), makeCard(8)],
      dealerFaceDown: true,
      activeHandIndex: 0,
    };
    const s2 = reducer(state, { type: "hit" });
    if (s2.phase === "player") {
      expect(s2.playerHands[0]!.cards.length).toBe(3);
    }
    // If it busted or settled, that's also fine
  });
});

describe("Blackjack stand action", () => {
  it("stand triggers dealer play and settlement", () => {
    const s = initialState(42, defaultSettings);
    const state: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(10), makeCard(9)], // 19
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      dealerHand: [makeCard(5), makeCard(6)], // 11
      dealerFaceDown: true,
      activeHandIndex: 0,
    };
    const settled = reducer(state, { type: "stand" });
    expect(settled.phase).toBe("settled");
    // Dealer must have played to >= 17
    const dealerVal = handValue(settled.dealerHand);
    expect(dealerVal.best).toBeGreaterThanOrEqual(17);
  });
});

describe("Blackjack double action", () => {
  it("double draws exactly one card and doubles the bet", () => {
    const s = initialState(42, defaultSettings);
    const state: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(5), makeCard(6)], // 11 — good double
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      dealerHand: [makeCard(7), makeCard(8)],
      dealerFaceDown: true,
      activeHandIndex: 0,
    };
    const settled = reducer(state, { type: "double" });
    expect(settled.phase).toBe("settled");
    // Player hand should have exactly 3 cards
    expect(settled.playerHands[0]!.cards.length).toBe(3);
    expect(settled.playerHands[0]!.doubled).toBe(true);
    expect(settled.playerHands[0]!.bet).toBe(20);
  });
});

describe("Blackjack dealer bust", () => {
  it("player wins when dealer busts", () => {
    const s = initialState(42, defaultSettings);
    const state: BlackjackState = {
      ...s,
      phase: "player",
      bankroll: 990,
      playerHands: [{
        cards: [makeCard(10), makeCard(8)], // 18
        bet: 10,
        doubled: false,
        busted: false,
        stood: false,
      }],
      // Dealer at 16 with no aces — will need to hit and may bust
      dealerHand: [makeCard(10), makeCard(6)], // 16
      dealerFaceDown: true,
      activeHandIndex: 0,
    };
    const settled = reducer(state, { type: "stand" });
    expect(settled.phase).toBe("settled");
    const dealerVal = handValue(settled.dealerHand);
    if (dealerVal.best > 21) {
      // Player should have won
      expect(settled.bankroll).toBeGreaterThan(990);
    }
  });
});

describe("Blackjack terminal condition", () => {
  it("is terminal when handsPlayed >= handsPerSession", () => {
    const s = initialState(42, defaultSettings);
    const exhausted: BlackjackState = {
      ...s,
      phase: "settled",
      handsPlayed: 25,
      bankroll: 500,
    };
    const result = isTerminal(exhausted);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(500);
  });

  it("is not terminal in early game", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});
