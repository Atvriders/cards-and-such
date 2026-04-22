import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, hasFourOfAKind } from "./state.js";
import type { KempsState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { rounds: "3" as const };

function card(rank: Card["rank"], suit: Card["suit"]): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("deals 4 cards to each player", () => {
    const s = initialState(1, settings);
    expect(s.hands[0]!.length).toBe(4);
    expect(s.hands[1]!.length).toBe(4);
    expect(s.hands[2]!.length).toBe(4);
    expect(s.hands[3]!.length).toBe(4);
  });

  it("center has 4 cards", () => {
    const s = initialState(1, settings);
    expect(s.center.length).toBe(4);
  });

  it("phase is swapping", () => {
    expect(initialState(1, settings).phase).toBe("swapping");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, settings);
    const s2 = initialState(77, settings);
    expect(s1.hands[0]).toEqual(s2.hands[0]);
  });
});

describe("hasFourOfAKind", () => {
  it("detects 4-of-a-kind", () => {
    const hand = [card(7, "♠"), card(7, "♥"), card(7, "♦"), card(7, "♣")];
    expect(hasFourOfAKind(hand)).toBe(7);
  });

  it("returns null when no 4-of-a-kind", () => {
    const hand = [card(7, "♠"), card(7, "♥"), card(5, "♦"), card(3, "♣")];
    expect(hasFourOfAKind(hand)).toBeNull();
  });

  it("handles empty hand", () => {
    expect(hasFourOfAKind([])).toBeNull();
  });
});

describe("reducer — swap", () => {
  it("swaps hand card with center card", () => {
    const s = initialState(1, settings);
    const handCard = card(2, "♠");
    const centerCard = card(9, "♥");
    const state: KempsState = {
      ...s,
      hands: [
        [handCard, card(5, "♦"), card(6, "♣"), card(8, "♠")],
        s.hands[1]!,
        s.hands[2]!,
        s.hands[3]!,
      ],
      center: [centerCard, card(3, "♣"), card(4, "♦"), card(10, "♠")],
    };
    const s2 = reducer(state, { type: "swap", handIdx: 0, centerIdx: 0 });
    expect(s2.hands[0]![0]).toEqual(centerCard);
    expect(s2.center[0]).toEqual(handCard);
  });
});

describe("reducer — signal", () => {
  it("team scores when partner has 4-of-a-kind", () => {
    const s = initialState(1, settings);
    const state: KempsState = {
      ...s,
      hands: [
        [card(2, "♠"), card(3, "♥"), card(4, "♦"), card(5, "♣")],
        [card(8, "♠"), card(8, "♥"), card(8, "♦"), card(8, "♣")],
        s.hands[2]!,
        s.hands[3]!,
      ],
    };
    const s2 = reducer(state, { type: "signal" });
    expect(s2.roundWinner).toBe("team");
    expect(s2.teamScore).toBe(1);
  });

  it("opponents score when partner does NOT have 4-of-a-kind", () => {
    const s = initialState(1, settings);
    const state: KempsState = {
      ...s,
      hands: [
        [card(2, "♠"), card(3, "♥"), card(4, "♦"), card(5, "♣")],
        [card(8, "♠"), card(8, "♥"), card(7, "♦"), card(6, "♣")],
        s.hands[2]!,
        s.hands[3]!,
      ],
    };
    const s2 = reducer(state, { type: "signal" });
    expect(s2.roundWinner).toBe("opp");
    expect(s2.oppScore).toBe(1);
  });
});

describe("reducer — stop-kemps", () => {
  it("team scores when opponent has 4-of-a-kind", () => {
    const s = initialState(1, settings);
    const state: KempsState = {
      ...s,
      hands: [
        s.hands[0]!,
        s.hands[1]!,
        [card(9, "♠"), card(9, "♥"), card(9, "♦"), card(9, "♣")],
        s.hands[3]!,
      ],
    };
    const s2 = reducer(state, { type: "stop-kemps" });
    expect(s2.teamScore).toBe(1);
    expect(s2.roundWinner).toBe("team");
  });

  it("opponents score on wrong stop-kemps call", () => {
    const s = initialState(1, settings);
    const state: KempsState = {
      ...s,
      hands: [
        s.hands[0]!,
        s.hands[1]!,
        [card(9, "♠"), card(9, "♥"), card(7, "♦"), card(5, "♣")],
        s.hands[3]!,
      ],
    };
    const s2 = reducer(state, { type: "stop-kemps" });
    expect(s2.oppScore).toBe(1);
    expect(s2.roundWinner).toBe("opp");
  });
});

describe("reducer — game wins match", () => {
  it("done when team reaches target rounds", () => {
    const s = initialState(1, settings);
    const state: KempsState = {
      ...s,
      teamScore: 2, // one more wins (target=3)
      hands: [
        s.hands[0]!,
        [card(6, "♠"), card(6, "♥"), card(6, "♦"), card(6, "♣")],
        s.hands[2]!,
        s.hands[3]!,
      ],
    };
    const s2 = reducer(state, { type: "signal" });
    expect(s2.phase).toBe("done");
    expect(s2.winner).toBe("team");
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns 100 for team win", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, winner: "team" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});
