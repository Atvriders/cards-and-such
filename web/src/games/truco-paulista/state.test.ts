import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, trucoPaulistaDeck, cardStrength } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function makeCard(suit: Card["suit"], rank: Card["rank"]): Card {
  return { suit, rank, id: `t-${suit}${rank}` };
}

describe("Truco Paulista - deck", () => {
  it("has 40 cards", () => {
    expect(trucoPaulistaDeck()).toHaveLength(40);
  });

  it("has no 8, 9, 10", () => {
    const ranks = trucoPaulistaDeck().map(c => c.rank);
    [8, 9, 10].forEach(r => expect(ranks).not.toContain(r));
  });
});

describe("Truco Paulista - cardStrength", () => {
  it("Clubs 4 is strongest manilha", () => {
    const c4 = makeCard("♣", 4);
    const h4 = makeCard("♥", 4);
    expect(cardStrength(c4)).toBeGreaterThan(cardStrength(h4));
  });

  it("any 4 beats Ace", () => {
    const d4 = makeCard("♦", 4); // weakest manilha
    const ace = makeCard("♠", 1);
    expect(cardStrength(d4)).toBeGreaterThan(cardStrength(ace));
  });

  it("Ace beats 7", () => {
    const ace = makeCard("♠", 1);
    const seven = makeCard("♠", 7);
    expect(cardStrength(ace)).toBeGreaterThan(cardStrength(seven));
  });
});

describe("Truco Paulista - initialState", () => {
  it("deals 3 cards each", () => {
    const state = initialState(42);
    expect(state.playerHand).toHaveLength(3);
    expect(state.botHand).toHaveLength(3);
  });

  it("starts in player-turn", () => {
    expect(initialState(42).phase).toBe("player-turn");
  });

  it("starts at 0-0 score", () => {
    const state = initialState(42);
    expect(state.playerScore).toBe(0);
    expect(state.botScore).toBe(0);
  });
});

describe("Truco Paulista - reducer", () => {
  it("playing a card ends in player-turn (after bot plays)", () => {
    const state = initialState(99);
    const next = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
    // After one round both played — next phase is player-turn or done
    expect(["player-turn", "done"]).toContain(next.phase);
  });

  it("game ends after 3 tricks", () => {
    let state = initialState(7);
    for (let i = 0; i < 3 && state.phase !== "done"; i++) {
      state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
    }
    expect(state.phase).toBe("done");
    expect(state.finalScores).not.toBeNull();
  });

  it("isTerminal returns score in [0,100] when done", () => {
    let state = initialState(5);
    for (let i = 0; i < 3 && state.phase !== "done"; i++) {
      state = reducer(state, { type: "play", cardId: state.playerHand[0]!.id });
    }
    const t = isTerminal(state);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});
