import { describe, expect, it } from "vitest";
import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import {
  DEFAULT_SHED,
  buildShedDeck,
  canPlay,
  shedInitial,
  shedReducer,
  shedTerminal,
  type SheddingState,
} from "./shedding-engine.js";

function c(suit: Suit, rank: number, tag = "x"): Card {
  return { suit, rank: rank as Rank, id: `${tag}-${suit}${rank}` };
}

function makeState(overrides: Partial<SheddingState> = {}): SheddingState {
  const top = c("♠", 5, "top");
  return {
    cfg: { ...DEFAULT_SHED },
    rngSeed: 1,
    playerHand: [],
    botHand: [c("♣", 2, "b")],
    stock: [c("♦", 3, "s1"), c("♣", 4, "s2"), c("♥", 6, "s3")],
    pile: [top],
    activeSuit: top.suit,
    activeRank: top.rank,
    phase: "player",
    pendingDraw: 0,
    pendingWild: null,
    winner: null,
    message: "",
    ...overrides,
  };
}

describe("shedding-engine", () => {
  it("buildShedDeck honors deckCopies + jokers and canPlay enforces match rules", () => {
    // Default deck = 1 copy, no jokers = 52
    expect(buildShedDeck({ ...DEFAULT_SHED }).length).toBe(52);
    // 2 copies + jokers = 2*52 + 2*2 = 108
    expect(
      buildShedDeck({ ...DEFAULT_SHED, deckCopies: 2, withJokers: true }).length,
    ).toBe(108);

    // rank-or-suit: top = 5♠
    const st = makeState();
    expect(canPlay(c("♠", 9, "a"), st)).toBe(true); // matches suit
    expect(canPlay(c("♥", 5, "a"), st)).toBe(true); // matches rank
    expect(canPlay(c("♥", 9, "a"), st)).toBe(false); // neither
    expect(canPlay(c("♥", 8, "a"), st)).toBe(true); // wildRank=8 always playable

    // pendingDraw stack: only the configured drawCard rank can stack
    const stackState = makeState({
      cfg: { ...DEFAULT_SHED, drawCard: { rank: 7, count: 2 }, wildRank: null },
      pendingDraw: 2,
    });
    expect(canPlay(c("♠", 5, "x"), stackState)).toBe(false);
    expect(canPlay(c("♥", 7, "y"), stackState)).toBe(true);

    // climb-up: must be >= top rank (aces high default)
    const climb = makeState({
      cfg: { ...DEFAULT_SHED, matchMode: "climb-up", wildRank: null },
      activeRank: 10,
      activeSuit: "♠",
    });
    expect(canPlay(c("♣", 9, "lo"), climb)).toBe(false);
    expect(canPlay(c("♣", 10, "eq"), climb)).toBe(true);
    expect(canPlay(c("♣", 12, "hi"), climb)).toBe(true);
  });

  it("playing the last non-wild card sets winner=player and shedTerminal scores 100", () => {
    const winning = c("♠", 9, "w");
    const state = makeState({
      playerHand: [winning],
      // disable wild so playing rank 9 doesn't trigger choose-suit branch
      cfg: { ...DEFAULT_SHED, wildRank: null },
    });

    const next = shedReducer(state, { type: "play", cardId: winning.id });
    expect(next.phase).toBe("done");
    expect(next.winner).toBe("player");
    expect(next.playerHand.length).toBe(0);
    expect(next.pile[next.pile.length - 1]?.id).toBe(winning.id);

    const term = shedTerminal(next);
    expect(term).toEqual({ score: 100 });

    // Non-terminal state returns null
    expect(shedTerminal(state)).toBeNull();
  });

  it("shedInitial deals deterministically and respects hand sizes / pile start", () => {
    const cfg = { ...DEFAULT_SHED };
    const a = shedInitial(42, cfg);
    const b = shedInitial(42, cfg);
    const diff = shedInitial(43, cfg);

    expect(a.playerHand.length).toBe(cfg.handSize);
    expect(a.botHand.length).toBe(cfg.handSize);
    expect(a.pile.length).toBe(1);
    expect(a.phase).toBe("player");
    expect(a.winner).toBeNull();

    // pile start card must not be the wild rank (engine skips wilds)
    expect(a.pile[0]!.rank).not.toBe(cfg.wildRank);

    // total cards conserved: 52 = hands + pile + stock
    expect(
      a.playerHand.length + a.botHand.length + a.pile.length + a.stock.length,
    ).toBe(52);

    // deterministic: same seed = same first player card id
    expect(b.playerHand[0]!.id).toBe(a.playerHand[0]!.id);
    // different seed should generally produce a different deal
    expect(diff.playerHand[0]!.id).not.toBe(a.playerHand[0]!.id);
  });
});
