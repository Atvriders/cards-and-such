import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlay } from "./state.js";
import type { SpitState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { botSpeed: "medium" as const };

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("each side has 5 reserve piles of 1 card", () => {
    const s = initialState(1, settings);
    expect(s.playerReserve.length).toBe(5);
    s.playerReserve.forEach(p => expect(p.length).toBe(1));
    expect(s.botReserve.length).toBe(5);
  });

  it("center piles start with 1 card each", () => {
    const s = initialState(1, settings);
    expect(s.centerPile0.length).toBe(1);
    expect(s.centerPile1.length).toBe(1);
  });

  it("phase is playing", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic", () => {
    const s1 = initialState(55, settings);
    const s2 = initialState(55, settings);
    expect(s1.centerPile0).toEqual(s2.centerPile0);
  });
});

describe("canPlay", () => {
  it("allows ±1 rank", () => {
    expect(canPlay(card(6), [card(5)])).toBe(true);
    expect(canPlay(card(6), [card(7)])).toBe(true);
  });

  it("Ace wraps to King", () => {
    expect(canPlay(card(1), [card(13)])).toBe(true);
    expect(canPlay(card(13), [card(1)])).toBe(true);
  });

  it("rejects non-adjacent rank", () => {
    expect(canPlay(card(6), [card(4)])).toBe(false);
  });

  it("rejects empty pile", () => {
    expect(canPlay(card(5), [])).toBe(false);
  });
});

describe("reducer — play", () => {
  it("plays reserve card to center when adjacent", () => {
    const s = initialState(1, settings);
    const center = card(7);
    const reserveCard = card(8);
    const pr = s.playerReserve;
    const state: SpitState = {
      ...s,
      centerPile0: [center],
      playerReserve: [[reserveCard], pr[1]!, pr[2]!, pr[3]!, pr[4]!],
    };
    const s2 = reducer(state, { type: "play", reserveIdx: 0, centerIdx: 0 });
    expect(s2.centerPile0.length).toBe(2);
    expect(s2.playerReserve[0]!.length).toBe(0);
  });

  it("ignores play when rank not adjacent", () => {
    const s = initialState(1, settings);
    const pr = s.playerReserve;
    const state: SpitState = {
      ...s,
      centerPile0: [card(7)],
      playerReserve: [[card(5)], pr[1]!, pr[2]!, pr[3]!, pr[4]!],
    };
    const s2 = reducer(state, { type: "play", reserveIdx: 0, centerIdx: 0 });
    expect(s2).toBe(state);
  });

  it("sets winner when player clears all reserves and spit pile", () => {
    const s = initialState(1, settings);
    const empty: readonly Card[] = [];
    const state: SpitState = {
      ...s,
      centerPile0: [card(7)],
      playerReserve: [[card(8)], empty, empty, empty, empty],
      playerSpitPile: [],
    };
    const s2 = reducer(state, { type: "play", reserveIdx: 0, centerIdx: 0 });
    expect(s2.winner).toBe("player");
    expect(s2.phase).toBe("done");
  });
});

describe("reducer — spit", () => {
  it("flips spit pile cards to centers", () => {
    const s = initialState(1, settings);
    const state: SpitState = {
      ...s,
      phase: "spit-ready",
      playerSpitPile: [card(3), card(5)],
      botSpitPile: [card(8), card(2)],
      centerPile0: [card(6)],
      centerPile1: [card(10)],
    };
    const s2 = reducer(state, { type: "spit" });
    expect(s2.centerPile0.length).toBe(2);
    expect(s2.centerPile1.length).toBe(2);
    expect(s2.playerSpitPile.length).toBe(1);
    expect(s2.phase).toBe("playing");
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns 100 for player win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "player" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns 0 for bot win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "bot" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
