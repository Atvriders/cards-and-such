import { describe, expect, it } from "vitest";
import {
  bjCardName,
  bjIsRed,
  bjRank,
  bjValue,
  bjTotal,
  bjIsSoft,
  dealerHits,
  dealerPlay,
  drawCard,
  settleHand,
  makeRng,
} from "./blackjack-engine.js";

describe("blackjack-engine", () => {
  it("computes card name, rank, value, color, and totals (including ace softening)", () => {
    // Card 0 => Ace of Spades (suit 0, rank 0)
    expect(bjCardName(0)).toBe("A♠");
    expect(bjRank(0)).toBe(0);
    expect(bjValue(0)).toBe(11);
    expect(bjIsRed(0)).toBe(false);

    // Card 24 => 24%13=11 => Q, 24/13=1 => Hearts
    expect(bjCardName(24)).toBe("Q♥");
    expect(bjIsRed(24)).toBe(true);
    expect(bjValue(24)).toBe(10);

    // Two aces + a nine: 11+11+9=31 → demote one ace → 21 (soft)
    const twoAcesNine = [0, 13, 8]; // A♠, A♥, 9♠
    expect(bjTotal(twoAcesNine)).toBe(21);
    expect(bjIsSoft(twoAcesNine)).toBe(true);

    // Hard 20: K♠ + Q♠ = 10+10 = 20, not soft
    const hard20 = [12, 11];
    expect(bjTotal(hard20)).toBe(20);
    expect(bjIsSoft(hard20)).toBe(false);

    // Hard bust: K + Q + 5 = 25 (no aces to soften)
    expect(bjTotal([12, 11, 4])).toBe(25);
  });

  it("dealer follows H17 rule and settleHand pays blackjack / detects busts and pushes", () => {
    // Dealer soft 17 (A + 6) hits when hitSoft17=true, stands when false
    const soft17 = [0, 5]; // A♠ + 6♠
    expect(bjTotal(soft17)).toBe(17);
    expect(bjIsSoft(soft17)).toBe(true);
    expect(dealerHits(soft17, true)).toBe(true);
    expect(dealerHits(soft17, false)).toBe(false);

    // Dealer hard 17 stands either way
    expect(dealerHits([12, 6], true)).toBe(false); // K + 7

    // Player natural BJ vs dealer 20: pays 1.5
    const playerBJ = settleHand([0, 9], [12, 11]); // A + 10 vs K + Q
    expect(playerBJ.pts).toBe(25);
    expect(playerBJ.result).toMatch(/Blackjack/);

    // Player busts
    expect(settleHand([12, 11, 4], [12, 6]).pts).toBe(0);

    // Push at 20
    const push = settleHand([12, 11], [10, 9]); // K+Q=20 vs J+10=20
    expect(push.pts).toBe(10);
    expect(push.result).toMatch(/Push/);

    // Surrender path
    const surr = settleHand([12, 11], [12, 11], { surrendered: true });
    expect(surr.pts).toBe(5);
    expect(surr.result).toMatch(/Surrendered/);
  });

  it("drawCard never repeats with single deck and dealerPlay reaches >=17 deterministically", () => {
    const { rng } = makeRng(42);
    const used = new Set<number>();
    const drawn: number[] = [];
    for (let i = 0; i < 10; i++) drawn.push(drawCard(rng, used, 1));
    // Single-deck draws must be unique
    expect(new Set(drawn).size).toBe(drawn.length);
    // All cards in 0..51
    for (const c of drawn) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(51);
    }

    // Dealer plays from a low total and must end at 17+ (or bust)
    const { rng: rng2 } = makeRng(7);
    const used2 = new Set<number>([2, 3]); // pretend 2♠,3♠ already used
    const dealerStart = [2, 3]; // 3♠ + 4♠ = 7
    const finalHand = dealerPlay(dealerStart, rng2, used2, true, 1);
    const finalTotal = bjTotal(finalHand);
    expect(finalHand.length).toBeGreaterThanOrEqual(dealerStart.length);
    // Either dealer stood at 17+ (and not soft 17), or busted
    if (finalTotal <= 21) {
      expect(finalTotal).toBeGreaterThanOrEqual(17);
      // If exactly 17 with H17, it must not be soft (otherwise he'd have hit)
      if (finalTotal === 17) expect(bjIsSoft(finalHand)).toBe(false);
    } else {
      expect(finalTotal).toBeGreaterThan(21);
    }
  });
});
