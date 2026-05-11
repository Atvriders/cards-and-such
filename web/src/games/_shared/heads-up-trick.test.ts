import { describe, expect, it } from "vitest";
import type { Rank } from "../../engines/deck/index.js";
import { makeHuTrick, type HuTrickState } from "./heads-up-trick.js";

const ALL_RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

describe("heads-up-trick", () => {
  it("initialState deals two hands of `perHand` cards each and sets trump from stock when requested", () => {
    const game = makeHuTrick({
      ranks: ALL_RANKS,
      perHand: 5,
      hasTrump: true,
      trumpFromStock: true,
      pointsPerTrick: 1,
    });
    const state = game.initialState(42);

    // 4 suits * 13 ranks * 1 copy = 52 cards; 5 to each player => 42 in stock.
    expect(state.hands.length).toBe(2);
    expect(state.hands[0]!.length).toBe(5);
    expect(state.hands[1]!.length).toBe(5);
    expect(state.stock.length).toBe(52 - 10);

    // Trump should be set to the suit of the bottom (last) stock card.
    expect(state.trump).not.toBeNull();
    expect(state.stock[state.stock.length - 1]!.suit).toBe(state.trump);

    // Hands contain only valid distinct cards (no duplicates between hands or stock).
    const all = [...state.hands[0]!, ...state.hands[1]!, ...state.stock];
    expect(new Set(all.map(c => c.id)).size).toBe(all.length);

    // Game starts in playing phase, with player 0 to act, no tricks played yet.
    expect(state.phase).toBe("playing");
    expect(state.turn).toBe(0);
    expect(state.leadSeat).toBe(0);
    expect(state.trick).toEqual([]);
    expect(state.score).toEqual([0, 0]);
    expect(state.tricksWon).toEqual([0, 0]);

    // Same seed → identical deal (determinism).
    const replay = game.initialState(42);
    expect(replay.hands[0]!.map(c => c.id)).toEqual(state.hands[0]!.map(c => c.id));
    expect(replay.hands[1]!.map(c => c.id)).toEqual(state.hands[1]!.map(c => c.id));
  });

  it("reducer ignores illegal actions and resolves a full trick when player plays a legal card", () => {
    // No-trump, no stock refill (perHand=2, ranks=4 => 8 cards, 4 dealt, 4 stock but
    // we only need to verify a single trick resolves cleanly).
    const game = makeHuTrick({
      ranks: [10, 11, 12, 13],
      perHand: 2,
      hasTrump: false,
      pointsPerTrick: 1,
    });
    const state = game.initialState(7);

    // Illegal: unknown card id is a no-op.
    const noop = game.reducer(state, { type: "play", cardId: "does-not-exist" });
    expect(noop).toBe(state);

    // Wrong action type is a no-op as well.
    // @ts-expect-error - exercising the defensive branch
    const noop2 = game.reducer(state, { type: "bogus" });
    expect(noop2).toBe(state);

    // Play a real card from the player's hand.
    const myCard = state.hands[0]![0]!;
    const stockBefore = state.stock.length;
    const after = game.reducer(state, { type: "play", cardId: myCard.id });

    // The trick must have been completed (CPU auto-played), so trick is reset
    // and exactly one of the two seats has a tricks-won bump.
    expect(after.trick).toEqual([]);
    expect(after.hands[0]!.find(c => c.id === myCard.id)).toBeUndefined();

    // Stock had >=2 cards, so both players draw one replacement => hand sizes
    // stay constant after the trick resolves and stock decreases by 2.
    expect(stockBefore).toBeGreaterThanOrEqual(2);
    expect(after.stock.length).toBe(stockBefore - 2);
    expect(after.hands[0]!.length).toBe(state.hands[0]!.length);
    expect(after.hands[1]!.length).toBe(state.hands[1]!.length);
    const tricksDelta =
      (after.tricksWon[0] - state.tricksWon[0]) +
      (after.tricksWon[1] - state.tricksWon[1]);
    expect(tricksDelta).toBe(1);

    // Winner of the trick leads the next one and is the new turn holder.
    expect(after.turn).toBe(after.leadSeat);

    // Score increments by pointsPerTrick (1) for the winner.
    const scoreDelta =
      (after.score[0] - state.score[0]) + (after.score[1] - state.score[1]);
    expect(scoreDelta).toBe(1);
  });

  it("plays an entire game to terminal state and isTerminal returns a 0–100 score only when done", () => {
    const game = makeHuTrick({
      ranks: [11, 12, 13, 1], // 4 ranks * 4 suits = 16 cards; perHand=8 → no stock.
      perHand: 8,
      hasTrump: false,
      pointsPerTrick: 1,
    });
    let state: HuTrickState = game.initialState(2024);

    // Mid-game, isTerminal must report null.
    expect(game.isTerminal(state)).toBeNull();

    // Drive the game forward by always playing the player's first legal card.
    // The reducer enforces follow-suit, so picking hands[0][0] may be illegal —
    // walk the hand to find a legal one each turn.
    let safety = 100;
    while (state.phase === "playing" && safety-- > 0) {
      // Determine legal options inline (mirrors trick-engine.legalPlays).
      const hand = state.hands[0]!;
      const led = state.trick[0]?.card.suit;
      const legal = led ? hand.filter(c => c.suit === led) : hand;
      const pick = (legal.length > 0 ? legal : hand)[0]!;
      const next = game.reducer(state, { type: "play", cardId: pick.id });
      // Reducer must make progress (or the game would loop forever).
      expect(next).not.toBe(state);
      state = next;
    }

    expect(state.phase).toBe("done");
    // 8 tricks played in total across both seats.
    expect(state.tricksWon[0] + state.tricksWon[1]).toBe(8);
    // Both hands fully consumed.
    expect(state.hands[0]!.length).toBe(0);
    expect(state.hands[1]!.length).toBe(0);

    const term = game.isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
    expect(term!.score).toBeLessThanOrEqual(100);

    // Done message reflects outcome.
    if (state.score[0] > state.score[1]) {
      expect(state.message).toMatch(/^You win/);
    } else if (state.score[0] < state.score[1]) {
      expect(state.message).toMatch(/^CPU wins/);
    } else {
      expect(state.message).toMatch(/^Tie/);
    }

    // Further actions are inert once done.
    const after = game.reducer(state, { type: "play", cardId: "anything" });
    expect(after).toBe(state);
  });
});
