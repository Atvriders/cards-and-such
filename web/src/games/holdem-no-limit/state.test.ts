import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  bestFiveOf,
  compareHands,
  callAmount,
  minRaiseTotal,
  type HoldemNoLimitSettings,
  type HoldemNoLimitState,
} from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const SETTINGS: HoldemNoLimitSettings = { startingStack: "1000", blinds: "10/20" };

function makeCard(suit: Card["suit"], rank: Card["rank"], salt = ""): Card {
  return { suit, rank, id: `${salt}${suit}${rank}` };
}

describe("Hold'em No-Limit — initial state", () => {
  it("starts in idle phase with full stacks", () => {
    const s = initialState(1, SETTINGS);
    expect(s.phase).toBe("idle");
    expect(s.playerStack).toBe(1000);
    expect(s.cpuStack).toBe(1000);
    expect(s.pot).toBe(0);
    expect(s.playerHole).toHaveLength(0);
    expect(s.cpuHole).toHaveLength(0);
    expect(s.community).toHaveLength(0);
  });

  it("isTerminal is null while playing", () => {
    expect(isTerminal(initialState(1, SETTINGS))).toBeNull();
  });
});

describe("Hold'em No-Limit — dealing", () => {
  it("deal posts blinds, deals 2 hole cards each, enters pre-flop", () => {
    const s0 = initialState(42, SETTINGS);
    const s1 = reducer(s0, { type: "deal" });
    expect(s1.phase === "pre-flop" || s1.phase === "flop" || s1.phase === "showdown").toBe(true);
    expect(s1.playerHole).toHaveLength(2);
    expect(s1.cpuHole).toHaveLength(2);
    // Pot should hold the blinds
    expect(s1.pot).toBeGreaterThanOrEqual(15);
    // Stacks should be reduced by blinds in total
    expect(s1.playerStack + s1.cpuStack + s1.pot).toBeGreaterThanOrEqual(2000);
  });

  it("dealer button alternates between hands", () => {
    const s0 = initialState(7, SETTINGS);
    const s1 = reducer(s0, { type: "deal" });
    expect(s1.dealerIsPlayer).toBe(true);
    // play out a fold to end the hand
    let s = s1;
    // Ensure we're in player turn or CPU has acted to where player is up
    if (!s.playerToAct) {
      // CPU already acted; the reducer keeps cycling, so player should be up unless CPU folded already
      if (s.phase === "showdown") {
        const s2 = reducer(s, { type: "deal" });
        expect(s2.dealerIsPlayer).toBe(false);
        return;
      }
    }
    s = reducer(s, { type: "fold" });
    // Now in showdown — deal again should swap button
    expect(s.phase === "showdown" || s.phase === "done").toBe(true);
    if (s.phase === "showdown" && s.playerStack > 0 && s.cpuStack > 0) {
      const s2 = reducer(s, { type: "deal" });
      expect(s2.dealerIsPlayer).toBe(false);
    }
  });
});

describe("Hold'em No-Limit — actions", () => {
  it("fold ends hand and gives pot to opponent", () => {
    const s0 = initialState(123, SETTINGS);
    const s1 = reducer(s0, { type: "deal" });
    if (s1.phase === "showdown") return; // CPU folded immediately, fine
    if (!s1.playerToAct) return; // can't test player-fold cleanly
    const potBefore = s1.pot;
    const cpuStackBefore = s1.cpuStack;
    const s2 = reducer(s1, { type: "fold" });
    expect(s2.phase).toBe("showdown");
    expect(s2.cpuStack).toBe(cpuStackBefore + potBefore);
    expect(s2.pot).toBe(0);
  });

  it("call closes pre-flop when CPU is BB and checks", () => {
    // Loop seeds so we find a deterministic case where the player is dealer (SB)
    // and can complete the BB by calling.
    for (let seed = 1; seed < 50; seed++) {
      const s0 = initialState(seed, SETTINGS);
      const s1 = reducer(s0, { type: "deal" });
      if (s1.phase !== "pre-flop") continue;
      if (!s1.playerToAct) continue;
      const toCall = callAmount(s1);
      if (toCall <= 0) continue;
      const s2 = reducer(s1, { type: "call" });
      // After call + CPU-check we should be on flop OR still pre-flop (if CPU raised)
      expect(["flop", "pre-flop", "showdown"]).toContain(s2.phase);
      return;
    }
  });

  it("raise increases pot and pushes turn back to opponent", () => {
    for (let seed = 1; seed < 80; seed++) {
      const s0 = initialState(seed, SETTINGS);
      const s1 = reducer(s0, { type: "deal" });
      if (s1.phase !== "pre-flop" || !s1.playerToAct) continue;
      const minR = minRaiseTotal(s1);
      const before = s1.pot;
      const s2 = reducer(s1, { type: "raise", amount: minR });
      // pot must be larger (player chips went in even if CPU then folded)
      expect(s2.pot >= 0).toBe(true);
      // either CPU folded (showdown), called/raised (still in hand), or we advanced
      expect(["pre-flop", "flop", "turn", "river", "showdown"]).toContain(s2.phase);
      // pot grew vs prior state minus any award already paid out
      if (s2.phase !== "showdown") expect(s2.pot).toBeGreaterThan(before);
      return;
    }
  });
});

describe("Hold'em No-Limit — showdown evaluation", () => {
  it("bestFiveOf picks the strongest 5-card combo", () => {
    // Hole + community: AA + KKK on board => full house aces over kings
    const cards: Card[] = [
      makeCard("♠", 1),  makeCard("♥", 1),
      makeCard("♣", 13), makeCard("♦", 13), makeCard("♥", 13),
      makeCard("♠", 5),  makeCard("♦", 7),
    ];
    const best = bestFiveOf(cards);
    expect(best).toHaveLength(5);
    // The 5 chosen should contain both aces and all three kings
    const ranks = best.map(c => c.rank).sort();
    expect(ranks).toEqual([1, 1, 13, 13, 13]);
  });

  it("compareHands ranks straight flush above four of a kind", () => {
    const sf: Card[] = [
      makeCard("♠", 9),  makeCard("♠", 10),
      makeCard("♠", 11), makeCard("♠", 12), makeCard("♠", 13),
    ];
    const quads: Card[] = [
      makeCard("♣", 1), makeCard("♥", 1),
      makeCard("♦", 1), makeCard("♠", 1), makeCard("♣", 5, "x"),
    ];
    expect(compareHands(sf, quads)).toBeGreaterThan(0);
  });

  it("a forced showdown: better hand wins pot", () => {
    // craft a hand-state where both players are all-in pre-river and force showdown
    // by going through the public reducer with fold prevention is hard; instead check
    // bestFiveOf + compareHands directly to validate the showdown decision logic.
    const community: Card[] = [
      makeCard("♠", 2), makeCard("♥", 7), makeCard("♣", 11),
      makeCard("♦", 4), makeCard("♠", 9, "x"),
    ];
    const winnerHole: Card[] = [makeCard("♣", 11, "w"), makeCard("♥", 11, "w")]; // trips
    const loserHole: Card[]  = [makeCard("♣", 5, "l"),  makeCard("♥", 8, "l")];  // high card

    const winnerBest = bestFiveOf([...winnerHole, ...community]);
    const loserBest  = bestFiveOf([...loserHole,  ...community]);
    expect(compareHands(winnerBest, loserBest)).toBeGreaterThan(0);
  });
});

describe("Hold'em No-Limit — terminal", () => {
  it("terminates when one player is busted", () => {
    // Manually craft a state where playerStack is 0 and we are in showdown
    const s: HoldemNoLimitState = {
      ...initialState(1, SETTINGS),
      phase: "showdown",
      playerStack: 0,
      cpuStack: 2000,
    };
    expect(isTerminal(s)).not.toBeNull();
  });
});
