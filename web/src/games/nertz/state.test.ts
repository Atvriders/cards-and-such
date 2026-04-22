import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlayToCenter, canPlayToRiver } from "./state.js";
import type { NertzState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { botSpeed: "medium" as const };

function card(rank: Card["rank"], suit: Card["suit"]): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("nertz pile has 12 cards", () => {
    const s = initialState(1, settings);
    expect(s.playerNertzPile.length).toBe(12);
    expect(s.botNertzPile.length).toBe(12);
  });

  it("river has 4 piles of 1 card each", () => {
    const s = initialState(1, settings);
    expect(s.playerRiver.length).toBe(4);
    s.playerRiver.forEach(p => expect(p.length).toBe(1));
  });

  it("starts in playing phase, no center piles", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
    expect(Object.keys(s.centerPiles).length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.playerNertzPile).toEqual(s2.playerNertzPile);
  });
});

describe("canPlayToCenter", () => {
  it("accepts Ace on empty center pile", () => {
    expect(canPlayToCenter(card(1, "♠"), {})).toBe(true);
  });

  it("rejects non-Ace on empty pile", () => {
    expect(canPlayToCenter(card(2, "♠"), {})).toBe(false);
  });

  it("accepts next rank same suit", () => {
    const piles = { "♠": [card(1, "♠")] } as Parameters<typeof canPlayToCenter>[1];
    expect(canPlayToCenter(card(2, "♠"), piles)).toBe(true);
  });

  it("rejects wrong suit", () => {
    const piles = { "♠": [card(1, "♠")] } as Parameters<typeof canPlayToCenter>[1];
    expect(canPlayToCenter(card(2, "♥"), piles)).toBe(false);
  });
});

describe("canPlayToRiver", () => {
  it("accepts any card on empty pile", () => {
    expect(canPlayToRiver(card(7, "♠"), [])).toBe(true);
  });

  it("accepts lower rank opposite color", () => {
    expect(canPlayToRiver(card(6, "♠"), [card(7, "♥")])).toBe(true);
  });

  it("rejects same color", () => {
    expect(canPlayToRiver(card(6, "♠"), [card(7, "♠")])).toBe(false);
  });

  it("rejects non-adjacent rank", () => {
    expect(canPlayToRiver(card(5, "♥"), [card(7, "♠")])).toBe(false);
  });
});

describe("reducer — flip-stream", () => {
  it("flips up to 3 cards from stream to hand", () => {
    const s = initialState(1, settings);
    const state: NertzState = {
      ...s,
      playerStream: [card(3, "♠"), card(4, "♥"), card(5, "♦"), card(6, "♣")],
      playerStreamHand: [],
    };
    const s2 = reducer(state, { type: "flip-stream" });
    expect(s2.playerStreamHand.length).toBe(3);
    expect(s2.playerStream.length).toBe(1);
  });

  it("recycles hand when stream empty", () => {
    const s = initialState(1, settings);
    const state: NertzState = {
      ...s,
      playerStream: [],
      playerStreamHand: [card(3, "♠"), card(4, "♥")],
    };
    const s2 = reducer(state, { type: "flip-stream" });
    expect(s2.playerStream.length).toBe(2);
    expect(s2.playerStreamHand.length).toBe(0);
  });
});

describe("reducer — play to center", () => {
  it("plays nertz top to center", () => {
    const s = initialState(1, settings);
    const aceSpade = card(1, "♠");
    const state: NertzState = {
      ...s,
      playerNertzPile: [card(5, "♥"), aceSpade],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-nertz-to-center" });
    expect(s2.centerPiles["♠"]?.length).toBe(1);
    expect(s2.playerNertzPile.length).toBe(1);
  });

  it("detects player win when nertz empties", () => {
    const s = initialState(1, settings);
    const state: NertzState = {
      ...s,
      playerNertzPile: [card(1, "♣")],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-nertz-to-center" });
    expect(s2.winner).toBe("player");
    expect(s2.phase).toBe("done");
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns positive score for player win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "player" as const };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
