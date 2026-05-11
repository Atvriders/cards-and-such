import { describe, expect, it } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { newDeck } from "../../engines/deck/index.js";
import {
  pgEmptySeat,
  pgInitialState,
  pgDeal,
  pgEndHand,
  pgStreetComplete,
  pgReducer,
  pgIsTerminal,
  type PGConfig,
  type PGState,
} from "./poker-game.js";

interface TestSettings {
  startingStack: number;
  smallBlind: number;
}

const cfg: PGConfig<TestSettings> = {
  totalHands: 3,
  startingStack: (s) => s.startingStack,
  smallBlind: (s) => s.smallBlind,
  holeCount: 2,
  buildDeck: () => newDeck(),
  // Player always wins judged showdown; deterministic for assertions.
  judge: () => ({ winner: "player", tag: "test" }),
  cpuStrength: () => 0,
};

describe("poker-game shared engine", () => {
  it("pgEmptySeat + pgInitialState set deterministic baseline", () => {
    const seat = pgEmptySeat(500);
    expect(seat).toEqual({ hole: [], bet: 0, stack: 500, folded: false, acted: false, discarded: [] });

    const state = pgInitialState<TestSettings>(123, { startingStack: 500, smallBlind: 5 }, cfg);
    expect(state.rngSeed).toBe(123);
    expect(state.phase).toBe("preflop");
    expect(state.player.stack).toBe(500);
    expect(state.cpu.stack).toBe(500);
    expect(state.pot).toBe(0);
    expect(state.handsPlayed).toBe(0);
    expect(state.showdownReveal).toBe(false);
    expect(state.community).toEqual([]);
    expect(state.deck).toEqual([]);
  });

  it("pgDeal posts blinds, deals hole cards, advances rngSeed", () => {
    const initial = pgInitialState<TestSettings>(42, { startingStack: 200, smallBlind: 10 }, cfg);
    const dealt = pgDeal(initial, cfg);

    // Blinds: SB=10, BB=20 → pot=30; stacks decremented.
    expect(dealt.player.bet).toBe(10);
    expect(dealt.cpu.bet).toBe(20);
    expect(dealt.player.stack).toBe(190);
    expect(dealt.cpu.stack).toBe(180);
    expect(dealt.pot).toBe(30);

    // Hole cards dealt to both seats.
    expect(dealt.player.hole).toHaveLength(2);
    expect(dealt.cpu.hole).toHaveLength(2);

    // No overlap between player and cpu hole cards.
    const ids = new Set<string>();
    for (const c of [...dealt.player.hole, ...dealt.cpu.hole]) ids.add(c.id);
    expect(ids.size).toBe(4);

    // Deck has remaining cards (52 - 4 = 48).
    expect(dealt.deck).toHaveLength(48);
    expect(dealt.phase).toBe("preflop");
    expect(dealt.toAct).toBe("player");
    expect(dealt.pendingDiscard).toBe(false);

    // rngSeed should be advanced (different from input).
    expect(dealt.rngSeed).not.toBe(42);

    // Determinism: dealing again with same seed produces identical hole cards.
    const dealt2 = pgDeal(initial, cfg);
    const ids1 = dealt.player.hole.map((c: Card) => c.id);
    const ids2 = dealt2.player.hole.map((c: Card) => c.id);
    expect(ids1).toEqual(ids2);
  });

  it("pgEndHand awards pot, increments handsPlayed, marks done after totalHands", () => {
    const state: PGState<TestSettings> = {
      ...pgInitialState<TestSettings>(1, { startingStack: 100, smallBlind: 5 }, cfg),
      pot: 60,
      handsPlayed: 2, // already played 2 of 3
    };
    const after = pgEndHand(state, "player", "test win", cfg.totalHands);
    expect(after.player.stack).toBe(160);
    expect(after.cpu.stack).toBe(100);
    expect(after.pot).toBe(0);
    expect(after.handsPlayed).toBe(3);
    expect(after.phase).toBe("done"); // hit totalHands
    expect(after.showdownReveal).toBe(true);
    expect(pgIsTerminal(after)).toEqual({ score: 160 });

    // Split path: odd pot of 61 → player gets floor(61/2)=30, cpu gets 31.
    const splitState: PGState<TestSettings> = { ...state, pot: 61, handsPlayed: 0 };
    const splitAfter = pgEndHand(splitState, "split", "tie", cfg.totalHands);
    expect(splitAfter.player.stack).toBe(130);
    expect(splitAfter.cpu.stack).toBe(131);
    expect(splitAfter.phase).toBe("showdown"); // not yet done

    // pgStreetComplete short-circuits if either folded.
    expect(pgStreetComplete({ ...state, player: { ...state.player, folded: true } })).toBe(true);
    // Both acted with equal bets and no pending discard → complete.
    expect(
      pgStreetComplete({
        ...state,
        player: { ...state.player, acted: true, bet: 10 },
        cpu: { ...state.cpu, acted: true, bet: 10 },
        pendingDiscard: false,
      }),
    ).toBe(true);
    // Unequal bets → not complete.
    expect(
      pgStreetComplete({
        ...state,
        player: { ...state.player, acted: true, bet: 10 },
        cpu: { ...state.cpu, acted: true, bet: 20 },
      }),
    ).toBe(false);
  });

  it("pgReducer fold ends the hand with cpu winning the pot", () => {
    const initial = pgInitialState<TestSettings>(7, { startingStack: 100, smallBlind: 5 }, cfg);
    const dealt = pgReducer(initial, { type: "deal" }, cfg);
    // Player folds → pgShowdown sees player.folded=true → cpu wins pot.
    const folded = pgReducer(dealt, { type: "fold" }, cfg);
    expect(folded.player.folded).toBe(true);
    expect(folded.cpu.stack).toBe(100 - 10 + dealt.pot); // cpu paid BB=10 then collected pot
    expect(folded.handsPlayed).toBe(1);
    expect(folded.showdownReveal).toBe(true);
    expect(folded.pot).toBe(0);
    // Phase is showdown (not done) since handsPlayed (1) < totalHands (3).
    expect(folded.phase).toBe("showdown");
  });
});
