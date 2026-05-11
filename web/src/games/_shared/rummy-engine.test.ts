import { describe, expect, it } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import {
  DEFAULT_RUMMY,
  buildDeck,
  cardValue,
  detectMelds,
  isJoker,
  isWild,
  rummyInitial,
  rummyReducer,
  rummyTerminal,
} from "./rummy-engine.js";

function c(suit: "♠" | "♥" | "♦" | "♣", rank: number, tag = "x"): Card {
  return { suit, rank: rank as Card["rank"], id: `${tag}-${suit}${rank}` };
}

describe("rummy-engine", () => {
  it("cardValue / isJoker / isWild / buildDeck honor the rule table", () => {
    // cardValue: Ace=1, 2-10=face, J/Q/K=10.
    expect(cardValue(1)).toBe(1);
    expect(cardValue(2)).toBe(2);
    expect(cardValue(9)).toBe(9);
    expect(cardValue(10)).toBe(10);
    expect(cardValue(11)).toBe(10);
    expect(cardValue(12)).toBe(10);
    expect(cardValue(13)).toBe(10);

    // Single deck no jokers → 52 cards.
    const single = buildDeck({ ...DEFAULT_RUMMY });
    expect(single.length).toBe(52);

    // Double deck + jokers → 2*52 + 2*2 = 108.
    const canasta = buildDeck({ ...DEFAULT_RUMMY, deckCopies: 2, withJokers: true });
    expect(canasta.length).toBe(108);
    const jokers = canasta.filter(isJoker);
    expect(jokers.length).toBe(4);

    // isWild: jokers always; 2s only when twosWild=true.
    const two = c("♠", 2);
    expect(isWild(two, { ...DEFAULT_RUMMY })).toBe(false);
    expect(isWild(two, { ...DEFAULT_RUMMY, twosWild: true })).toBe(true);
    expect(isWild(jokers[0]!, { ...DEFAULT_RUMMY })).toBe(true);
  });

  it("detectMelds finds a set + a run and reports correct deadwood", () => {
    // Hand: set of 7s (♠7,♥7,♦7), run 4♣-5♣-6♣, plus two stragglers K♠ + 9♥.
    const hand: Card[] = [
      c("♠", 7, "a"),
      c("♥", 7, "b"),
      c("♦", 7, "c"),
      c("♣", 4, "d"),
      c("♣", 5, "e"),
      c("♣", 6, "f"),
      c("♠", 13, "g"), // K = 10
      c("♥", 9, "h"),  // 9
    ];
    const result = detectMelds(hand);
    // Two melds expected.
    expect(result.melds.length).toBe(2);
    // Deadwood is exactly the two stragglers totalling 10 + 9 = 19.
    expect(result.deadwood.length).toBe(2);
    expect(result.deadwoodValue).toBe(19);
    const dwIds = new Set(result.deadwood.map(d => d.id));
    expect(dwIds.has("g-♠13")).toBe(true);
    expect(dwIds.has("h-♥9")).toBe(true);

    // Empty hand short-circuits to zero deadwood.
    const empty = detectMelds([]);
    expect(empty.melds).toEqual([]);
    expect(empty.deadwood).toEqual([]);
    expect(empty.deadwoodValue).toBe(0);
  });

  it("rummyInitial deals the expected shape and the reducer drives a draw→discard turn", () => {
    const cfg = { ...DEFAULT_RUMMY };
    const state = rummyInitial(12345, cfg);

    // Deal shape.
    expect(state.playerHand.length).toBe(cfg.handSize);
    expect(state.botHand.length).toBe(cfg.handSize);
    expect(state.discardPile.length).toBe(1);
    // 52 total - 10 - 10 - 1 discard = 31 stock cards.
    expect(state.stock.length).toBe(52 - cfg.handSize * 2 - 1);
    expect(state.phase).toBe("player-draw");
    expect(state.finalScore).toBeNull();
    expect(rummyTerminal(state)).toBeNull();

    // No duplicate ids anywhere.
    const allIds = [
      ...state.playerHand.map(x => x.id),
      ...state.botHand.map(x => x.id),
      ...state.stock.map(x => x.id),
      ...state.discardPile.map(x => x.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);

    // Draw from stock → hand grows by 1, stock shrinks by 1, phase advances.
    const drawn = rummyReducer(state, { type: "draw", from: "stock" });
    expect(drawn.playerHand.length).toBe(cfg.handSize + 1);
    expect(drawn.stock.length).toBe(state.stock.length - 1);
    expect(drawn.phase).toBe("player-discard");

    // Invalid action for the current phase is a no-op (returns same state).
    const bogus = rummyReducer(state, { type: "discard", cardId: "nope" });
    expect(bogus).toBe(state);

    // Discard an actual card → bot takes its turn → state advances out of player-discard.
    const cardToDiscard = drawn.playerHand[0]!;
    const afterDiscard = rummyReducer(drawn, { type: "discard", cardId: cardToDiscard.id });
    expect(afterDiscard.playerHand.length).toBe(cfg.handSize);
    // Discarded card is no longer in the player's hand.
    expect(afterDiscard.playerHand.find(x => x.id === cardToDiscard.id)).toBeUndefined();
    // Bot has acted: either game is done, or it's back to player-draw.
    expect(["player-draw", "done"]).toContain(afterDiscard.phase);

    // Deterministic: same seed reproduces the same initial deal.
    const replay = rummyInitial(12345, cfg);
    expect(replay.playerHand.map(x => x.id)).toEqual(state.playerHand.map(x => x.id));
    expect(replay.botHand.map(x => x.id)).toEqual(state.botHand.map(x => x.id));
  });
});
