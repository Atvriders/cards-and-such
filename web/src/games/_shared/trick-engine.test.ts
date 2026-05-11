import { describe, expect, it } from "vitest";
import {
  buildDeck,
  defaultRankOrder,
  pinochleRankOrder,
  tressetteRankOrder,
  trickWinner,
  legalPlays,
  cpuPlayCard,
  dealHands,
  suitName,
} from "./trick-engine.js";
import type { Card } from "../../engines/deck/index.js";

describe("trick-engine", () => {
  it("buildDeck respects ranks, copies, and rank orderings", () => {
    const euchreRanks = [9, 10, 11, 12, 13, 1] as const;
    const single = buildDeck({ ranks: euchreRanks });
    expect(single.length).toBe(24); // 4 suits * 6 ranks * 1 copy
    expect(new Set(single.map((c) => c.id)).size).toBe(24);

    const pinochle = buildDeck({ ranks: euchreRanks, copies: 2 }, "p");
    expect(pinochle.length).toBe(48);
    expect(pinochle[0]!.id.startsWith("p-0-")).toBe(true);

    // rank orderings
    expect(defaultRankOrder(1)).toBe(14); // ace high
    expect(defaultRankOrder(13)).toBe(13);
    expect(pinochleRankOrder(10)).toBe(13); // 10 ranks just under ace
    expect(pinochleRankOrder(1)).toBe(14);
    expect(pinochleRankOrder(11)).toBe(11);
    expect(tressetteRankOrder(3)).toBe(14); // 3 is top
    expect(tressetteRankOrder(2)).toBe(13);
    expect(tressetteRankOrder(4)).toBe(5);

    expect(suitName("♠")).toBe("Spades");
    expect(suitName("♥")).toBe("Hearts");
    expect(suitName("♦")).toBe("Diamonds");
    expect(suitName("♣")).toBe("Clubs");
  });

  it("trickWinner honors trump > led > off-suit, with rank as tiebreak", () => {
    const c = (suit: Card["suit"], rank: Card["rank"], id: string): Card => ({ suit, rank, id });
    // Led spades; trump clubs. Player 2 plays trump 2 and wins over ace of led.
    const trick = [
      { seat: 0, card: c("♠", 1, "s1") }, // led ace of spades (strength 514)
      { seat: 1, card: c("♠", 13, "s13") }, // follows (513)
      { seat: 2, card: c("♣", 2, "c2") }, // trump 2 (1002) wins
      { seat: 3, card: c("♦", 1, "d1") }, // off suit (14)
    ] as const;
    expect(trickWinner(trick, "♣")).toBe(2);

    // No trump: highest in led suit wins (ace high)
    const noTrump = [
      { seat: 0, card: c("♥", 10, "h10") },
      { seat: 1, card: c("♥", 1, "h1") }, // ace beats 10
      { seat: 2, card: c("♠", 13, "s13") }, // off-suit can't win
    ] as const;
    expect(trickWinner(noTrump, null)).toBe(1);

    // Empty trick → -1
    expect(trickWinner([], null)).toBe(-1);
  });

  it("legalPlays enforces follow-suit; dealHands partitions deck; cpuPlayCard picks legal cheap winner", () => {
    const c = (suit: Card["suit"], rank: Card["rank"], id: string): Card => ({ suit, rank, id });
    const hand: Card[] = [c("♠", 5, "s5"), c("♠", 10, "s10"), c("♥", 1, "h1"), c("♦", 7, "d7")];
    // Empty trick → all legal
    expect(legalPlays(hand, []).length).toBe(4);
    // Led hearts → only hearts allowed
    const led = [{ seat: 0, card: c("♥", 13, "h13") }];
    const legal = legalPlays(hand, led);
    expect(legal.length).toBe(1);
    expect(legal[0]!.suit).toBe("♥");
    // Led clubs (none in hand) → all cards legal
    const ledClubs = [{ seat: 0, card: c("♣", 13, "c13") }];
    expect(legalPlays(hand, ledClubs).length).toBe(4);

    // dealHands
    const deck = buildDeck({ ranks: [1, 2, 3, 4, 5] }); // 4*5 = 20
    const { hands, stock } = dealHands(deck, 4, 4);
    expect(hands.length).toBe(4);
    hands.forEach((h) => expect(h.length).toBe(4));
    expect(stock.length).toBe(4);
    // No card dealt twice
    const allIds = hands.flat().concat(stock).map((cc) => cc.id);
    expect(new Set(allIds).size).toBe(20);

    // cpuPlayCard: led hearts; CPU has only one heart → forced
    const cpuHand: Card[] = [c("♥", 5, "h5"), c("♠", 1, "s1"), c("♦", 9, "d9")];
    const trick = [{ seat: 0, card: c("♥", 3, "h3") }];
    const forced = cpuPlayCard(cpuHand, trick, "♣", 1, null);
    expect(forced.id).toBe("h5");

    // cpuPlayCard: can win cheaply in led suit
    const cpuHand2: Card[] = [c("♥", 4, "h4"), c("♥", 12, "h12"), c("♠", 1, "s1")];
    const trick2 = [{ seat: 0, card: c("♥", 9, "h9") }];
    const winnerPick = cpuPlayCard(cpuHand2, trick2, null, 1, null);
    // Should pick Q♥ (12) — cheapest winner over 9
    expect(winnerPick.id).toBe("h12");

    // cpuPlayCard: partner winning → dump lowest legal
    const cpuHand3: Card[] = [c("♥", 4, "h4"), c("♥", 12, "h12"), c("♦", 2, "d2")];
    const trick3 = [
      { seat: 0, card: c("♥", 3, "h3") }, // opponent leads
      { seat: 2, card: c("♥", 1, "h1") }, // partner (seat 2) plays ace, winning
    ];
    const dump = cpuPlayCard(cpuHand3, trick3, null, 1, 2);
    // Must follow hearts; partner winning → cheapest heart
    expect(dump.id).toBe("h4");
  });
});
