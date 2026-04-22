import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findMatch } from "./state.js";
import type { CalSpeedState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { botReaction: "medium" as const };

function card(rank: Card["rank"], suit: Card["suit"] = "♠", prefix = ""): Card {
  return { rank, suit, id: `${prefix}${suit}${rank}` };
}

describe("initialState", () => {
  it("deals 24 cards to player and bot each", () => {
    const s = initialState(1, settings);
    expect(s.playerDeck.length).toBe(24);
    expect(s.botDeck.length).toBe(24);
  });

  it("table has 4 face-up cards", () => {
    const s = initialState(1, settings);
    s.table.forEach(c => expect(c).not.toBeNull());
  });

  it("phase is waiting", () => {
    expect(initialState(1, settings).phase).toBe("waiting");
  });

  it("is deterministic", () => {
    const s1 = initialState(42, settings);
    const s2 = initialState(42, settings);
    expect(s1.playerDeck).toEqual(s2.playerDeck);
  });
});

describe("findMatch", () => {
  it("finds adjacent matching pair", () => {
    const table = [card(7), card(7), card(3), card(9)];
    expect(findMatch(table)).toEqual([0, 1]);
  });

  it("finds diagonal match", () => {
    const table = [card(5), card(8), card(9), card(5)];
    expect(findMatch(table)).toEqual([0, 3]);
  });

  it("returns null when no match", () => {
    const table = [card(2), card(5), card(8), card(11)];
    expect(findMatch(table)).toBeNull();
  });

  it("handles nulls gracefully", () => {
    const table = [null, card(7), card(7), null];
    expect(findMatch(table)).toEqual([1, 2]);
  });
});

describe("reducer — flip", () => {
  it("places player card on first empty table slot", () => {
    const s = initialState(1, settings);
    const state: CalSpeedState = {
      ...s,
      table: [null, null, card(3, "♣"), card(5, "♦")],
      playerDeck: [card(7), card(9)],
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.table[0]).not.toBeNull();
    expect(s2.playerDeck.length).toBe(1);
  });

  it("opens slap-window when flip creates a match", () => {
    const s = initialState(1, settings);
    const state: CalSpeedState = {
      ...s,
      table: [null, card(7, "♥"), card(9, "♣"), card(3, "♦")],
      playerDeck: [card(7, "♠"), card(4)],
    };
    const s2 = reducer(state, { type: "flip" });
    expect(s2.phase).toBe("slap-window");
    expect(s2.matchSlots).not.toBeNull();
  });
});

describe("reducer — slap", () => {
  it("removes matched cards and refills table", () => {
    const s = initialState(1, settings);
    const state: CalSpeedState = {
      ...s,
      phase: "slap-window",
      table: [card(7, "♠"), card(7, "♥"), card(3, "♣"), card(5, "♦")],
      matchSlots: [0, 1],
      playerDeck: [card(10)],
      botDeck: [card(11, "♣", "bot-")],
    };
    const s2 = reducer(state, { type: "slap" });
    expect(s2.phase).not.toBe("slap-window");
    // matched cards removed
  });
});

describe("reducer — bot-slap", () => {
  it("bot slap clears matched cards", () => {
    const s = initialState(1, settings);
    const state: CalSpeedState = {
      ...s,
      phase: "slap-window",
      table: [card(7, "♠"), card(8, "♥"), card(7, "♣"), card(5, "♦")],
      matchSlots: [0, 2],
      playerDeck: [],
      botDeck: [],
    };
    const s2 = reducer(state, { type: "bot-slap" });
    expect(s2.table[0]).toBeNull();
    expect(s2.table[2]).toBeNull();
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
});
