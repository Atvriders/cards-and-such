import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlayToCenter } from "./state.js";
import type { DutchBlitzState, DBCard } from "./state.js";

const medSettings = { botSpeed: "medium" as const, strictColors: false };

function makeCard(color: DBCard["color"], rank: number, prefix = ""): DBCard {
  return { color, rank, id: `${prefix}${color}-${rank}` };
}

describe("initialState", () => {
  it("creates blitz pile of 10 cards", () => {
    const s = initialState(1, medSettings);
    expect(s.playerBlitzPile.length).toBe(10);
    expect(s.botBlitzPile.length).toBe(10);
  });

  it("starts in playing phase with no center piles", () => {
    const s = initialState(1, medSettings);
    expect(s.phase).toBe("playing");
    expect(s.centerPiles.length).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, medSettings);
    const s2 = initialState(42, medSettings);
    expect(s1.playerBlitzPile).toEqual(s2.playerBlitzPile);
  });

  it("different seeds produce different states", () => {
    const s1 = initialState(1, medSettings);
    const s2 = initialState(2, medSettings);
    expect(s1.playerBlitzPile).not.toEqual(s2.playerBlitzPile);
  });
});

describe("canPlayToCenter", () => {
  it("allows rank 1 on empty pile", () => {
    const card = makeCard("red", 1);
    expect(canPlayToCenter(card, [])).toBe(true);
  });

  it("rejects rank 2 on empty pile", () => {
    const card = makeCard("red", 2);
    expect(canPlayToCenter(card, [])).toBe(false);
  });

  it("allows same color, next rank", () => {
    const pile = [makeCard("blue", 1), makeCard("blue", 2)];
    const card = makeCard("blue", 3);
    expect(canPlayToCenter(card, pile)).toBe(true);
  });

  it("rejects different color", () => {
    const pile = [makeCard("blue", 1)];
    const card = makeCard("red", 2);
    expect(canPlayToCenter(card, pile)).toBe(false);
  });
});

describe("reducer — play-blitz-to-center", () => {
  it("plays blitz top card to center when valid", () => {
    const s = initialState(1, medSettings);
    const blitzCard = makeCard("red", 1);
    const state: DutchBlitzState = {
      ...s,
      playerBlitzPile: [makeCard("red", 3), blitzCard],
      centerPiles: [],
    };
    const s2 = reducer(state, { type: "play-blitz-to-center", centerIdx: 0 });
    expect(s2.centerPiles.length).toBe(1);
    expect(s2.playerBlitzPile.length).toBe(1);
  });

  it("ignores invalid play (color mismatch)", () => {
    const s = initialState(1, medSettings);
    const blitzCard = makeCard("red", 2);
    const state: DutchBlitzState = {
      ...s,
      playerBlitzPile: [blitzCard],
      centerPiles: [[makeCard("blue", 1)]],
    };
    const s2 = reducer(state, { type: "play-blitz-to-center", centerIdx: 0 });
    expect(s2).toBe(state);
  });

  it("sets winner=player when blitz pile emptied", () => {
    const s = initialState(1, medSettings);
    const state: DutchBlitzState = {
      ...s,
      playerBlitzPile: [makeCard("red", 1)],
      centerPiles: [],
    };
    const s2 = reducer(state, { type: "play-blitz-to-center", centerIdx: 0 });
    expect(s2.winner).toBe("player");
    expect(s2.phase).toBe("done");
  });
});

describe("reducer — flip-wood", () => {
  it("flips top card from wood pile to hand", () => {
    const s = initialState(1, medSettings);
    const state: DutchBlitzState = {
      ...s,
      playerWoodPile: [makeCard("green", 5), makeCard("yellow", 3)],
      playerWoodHand: [],
    };
    const s2 = reducer(state, { type: "flip-wood" });
    expect(s2.playerWoodHand.length).toBe(1);
    expect(s2.playerWoodPile.length).toBe(1);
  });

  it("recycles hand back to wood pile when wood pile empty", () => {
    const s = initialState(1, medSettings);
    const state: DutchBlitzState = {
      ...s,
      playerWoodPile: [],
      playerWoodHand: [makeCard("blue", 4), makeCard("red", 7)],
    };
    const s2 = reducer(state, { type: "flip-wood" });
    expect(s2.playerWoodPile.length).toBe(2);
    expect(s2.playerWoodHand.length).toBe(0);
  });
});

describe("reducer — bot-tick", () => {
  it("bot plays blitz card to center when possible", () => {
    const s = initialState(1, medSettings);
    const botCard = makeCard("red", 1, "bot-");
    const state: DutchBlitzState = {
      ...s,
      botBlitzPile: [makeCard("blue", 5, "bot-"), botCard],
      centerPiles: [],
      botTickCounter: 99,
    };
    const s2 = reducer(state, { type: "bot-tick" });
    // bot should have played the rank-1 card
    expect(s2.centerPiles.length).toBe(1);
    expect(s2.botBlitzPile.length).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, medSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(1, medSettings), phase: "done" as const, winner: "player" as const };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
