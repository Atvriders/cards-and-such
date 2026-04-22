import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canToCenter } from "./state.js";
import type { LigrettoState, LiCard } from "./state.js";

const settings = { botSpeed: "medium" as const };

function card(color: LiCard["color"], rank: number, prefix = ""): LiCard {
  return { color, rank, id: `${prefix}${color}-${rank}` };
}

describe("initialState", () => {
  it("ligretto pile has 10 cards", () => {
    const s = initialState(1, settings);
    expect(s.playerLigretto.length).toBe(10);
    expect(s.botLigretto.length).toBe(10);
  });

  it("row has 3 cards", () => {
    const s = initialState(1, settings);
    expect(s.playerRow.length).toBe(3);
    s.playerRow.forEach(c => expect(c).not.toBeNull());
  });

  it("phase is playing, no center piles", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
    expect(Object.keys(s.centerPiles).length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77, settings);
    const s2 = initialState(77, settings);
    expect(s1.playerLigretto).toEqual(s2.playerLigretto);
  });
});

describe("canToCenter", () => {
  it("accepts rank 1 on empty pile", () => {
    expect(canToCenter(card("red", 1), {})).toBe(true);
  });

  it("rejects rank 2 on empty pile", () => {
    expect(canToCenter(card("red", 2), {})).toBe(false);
  });

  it("accepts next rank same color", () => {
    expect(canToCenter(card("blue", 3), { blue: [card("blue", 1), card("blue", 2)] })).toBe(true);
  });

  it("rejects wrong color", () => {
    expect(canToCenter(card("green", 2), { blue: [card("blue", 1)] })).toBe(false);
  });
});

describe("reducer — play-ligretto-to-center", () => {
  it("plays ligretto top to center when valid", () => {
    const s = initialState(1, settings);
    const state: LigrettoState = {
      ...s,
      playerLigretto: [card("red", 3), card("red", 1)],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-ligretto-to-center" });
    expect(s2.playerLigretto.length).toBe(1);
    expect(s2.centerPiles["red"]?.length).toBe(1);
  });

  it("ignores invalid play", () => {
    const s = initialState(1, settings);
    const state: LigrettoState = {
      ...s,
      playerLigretto: [card("red", 3)],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-ligretto-to-center" });
    expect(s2).toBe(state);
  });

  it("detects player win when pile empties", () => {
    const s = initialState(1, settings);
    const state: LigrettoState = {
      ...s,
      playerLigretto: [card("green", 1)],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-ligretto-to-center" });
    expect(s2.winner).toBe("player");
    expect(s2.phase).toBe("done");
  });
});

describe("reducer — flip-hand", () => {
  it("moves top hand card to handTop", () => {
    const s = initialState(1, settings);
    const state: LigrettoState = {
      ...s,
      playerHand: [card("blue", 5), card("yellow", 2)],
      playerHandTop: null,
    };
    const s2 = reducer(state, { type: "flip-hand" });
    expect(s2.playerHandTop).not.toBeNull();
    expect(s2.playerHand.length).toBe(1);
  });
});

describe("reducer — play-row-to-center", () => {
  it("plays row card to center and refills from ligretto", () => {
    const s = initialState(1, settings);
    const rowCard = card("yellow", 1);
    const ligCard = card("red", 5);
    const state: LigrettoState = {
      ...s,
      playerRow: [rowCard, card("blue", 4), card("green", 3)],
      playerLigretto: [ligCard],
      centerPiles: {},
    };
    const s2 = reducer(state, { type: "play-row-to-center", rowIdx: 0 });
    expect(s2.centerPiles["yellow"]?.length).toBe(1);
    expect(s2.playerRow[0]).toEqual(ligCard);
    expect(s2.playerLigretto.length).toBe(0);
  });
});

describe("reducer — bot-tick", () => {
  it("bot plays ligretto to center when possible", () => {
    const s = initialState(1, settings);
    const botCard = card("red", 1, "bot-");
    const state: LigrettoState = {
      ...s,
      botLigretto: [card("blue", 5, "bot-"), botCard],
      centerPiles: {},
      botTickCounter: 99,
    };
    const s2 = reducer(state, { type: "bot-tick" });
    expect(s2.centerPiles["red"]?.length).toBe(1);
    expect(s2.botLigretto.length).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score on player win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "player" as const };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("returns lower score on bot win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "bot" as const };
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(0);
  });
});
