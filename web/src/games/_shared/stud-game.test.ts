import { describe, expect, it } from "vitest";
import {
  studEmptySeat,
  studInitialState,
  studDeal,
  studReducer,
  studIsTerminal,
  type StudConfig,
  type StudSeat,
} from "./stud-game.js";

interface S {
  stack: number;
  ante: number;
  smallBet: number;
}

function makeCfg(overrides: Partial<StudConfig<S>> = {}): StudConfig<S> {
  return {
    totalHands: 3,
    startingStack: (s) => s.stack,
    ante: (s) => s.ante,
    smallBet: (s) => s.smallBet,
    schedule: [
      { perPlayer: 2, faces: [false, true] }, // street 1
      { perPlayer: 1, faces: [true] },        // street 2
    ],
    judge: (player: StudSeat, cpu: StudSeat) => {
      // Player wins iff first card rank is higher; otherwise cpu wins (no splits).
      const p = player.cards[0]!.rank;
      const c = cpu.cards[0]!.rank;
      if (p > c) return { winner: "player", tag: "higher" };
      if (p < c) return { winner: "cpu", tag: "higher" };
      return { winner: "split", tag: "tied" };
    },
    cpuStrength: () => 0.0, // Always weak → CPU folds whenever there is anything to call.
    ...overrides,
  };
}

const SETTINGS: S = { stack: 1000, ante: 10, smallBet: 20 };

describe("stud-game", () => {
  it("studInitialState seeds an idle game with empty seats and full stacks", () => {
    const state = studInitialState(123, SETTINGS, makeCfg());

    expect(state.street).toBe(0);
    expect(state.handsPlayed).toBe(0);
    expect(state.pot).toBe(0);
    expect(state.done).toBe(false);
    expect(state.toAct).toBe("player");
    expect(state.player).toEqual(studEmptySeat(1000));
    expect(state.cpu).toEqual(studEmptySeat(1000));
    expect(state.deck).toEqual([]);
    expect(state.message).toMatch(/Deal/i);
    expect(studIsTerminal(state)).toBeNull();
  });

  it("studDeal posts antes, deals the first-street schedule, and is deterministic by seed", () => {
    const cfg = makeCfg();
    const start = studInitialState(42, SETTINGS, cfg);
    const dealt = studDeal(start, cfg);

    // Antes posted from each stack into the pot.
    expect(dealt.pot).toBe(SETTINGS.ante * 2);
    expect(dealt.player.stack).toBe(SETTINGS.stack - SETTINGS.ante);
    expect(dealt.cpu.stack).toBe(SETTINGS.stack - SETTINGS.ante);

    // First street: 2 cards each, alternating, face pattern [down, up].
    expect(dealt.player.cards).toHaveLength(2);
    expect(dealt.cpu.cards).toHaveLength(2);
    expect(dealt.player.up).toEqual([false, true]);
    expect(dealt.cpu.up).toEqual([false, true]);

    // Street advanced, action returns to player, remaining deck shrank by 4.
    expect(dealt.street).toBe(1);
    expect(dealt.toAct).toBe("player");
    expect(dealt.deck.length).toBe(52 - 4);
    expect(dealt.showdownReveal).toBe(false);

    // Determinism: same seed → same dealt cards.
    const replay = studDeal(studInitialState(42, SETTINGS, cfg), cfg);
    expect(replay.player.cards.map((c) => c.id)).toEqual(dealt.player.cards.map((c) => c.id));
    expect(replay.cpu.cards.map((c) => c.id)).toEqual(dealt.cpu.cards.map((c) => c.id));

    // rngSeed advanced.
    expect(dealt.rngSeed).not.toBe(start.rngSeed);
  });

  it("player fold awards pot to CPU, bumps handsPlayed, and reducer ignores actions while idle/done", () => {
    const cfg = makeCfg({ totalHands: 1 }); // single hand → done after one fold
    const start = studInitialState(7, SETTINGS, cfg);

    // Actions other than 'deal' are ignored before any deal.
    const ignoredFold = studReducer(start, { type: "fold" }, cfg);
    expect(ignoredFold).toBe(start);

    const dealt = studReducer(start, { type: "deal" }, cfg);
    expect(dealt.street).toBe(1);
    expect(dealt.pot).toBe(SETTINGS.ante * 2);

    // Double-deal in the same street is a no-op.
    const doubleDeal = studReducer(dealt, { type: "deal" }, cfg);
    expect(doubleDeal).toBe(dealt);

    const folded = studReducer(dealt, { type: "fold" }, cfg);
    expect(folded.player.folded).toBe(true);
    expect(folded.pot).toBe(0);
    expect(folded.showdownReveal).toBe(true);
    expect(folded.handsPlayed).toBe(1);
    expect(folded.street).toBe(0);
    expect(folded.done).toBe(true);
    expect(folded.message).toMatch(/CPU wins/);

    // CPU collected the pot (20). Player paid the ante (10).
    expect(folded.cpu.stack).toBe(SETTINGS.stack - SETTINGS.ante + SETTINGS.ante * 2);
    expect(folded.player.stack).toBe(SETTINGS.stack - SETTINGS.ante);

    // Terminal score is the player's final stack.
    const term = studIsTerminal(folded);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(folded.player.stack);

    // Any further action on a done game is inert.
    const afterDone = studReducer(folded, { type: "deal" }, cfg);
    expect(afterDone).toBe(folded);
  });
});
