import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, doppelkopfDeck, cardValue, isTrump, trumpOrder, trickWinner } from "./state.js";

describe("Doppelkopf - deck", () => {
  it("has exactly 48 cards", () => {
    expect(doppelkopfDeck()).toHaveLength(48);
  });

  it("has exactly 2 copies of each card", () => {
    const deck = doppelkopfDeck();
    const counts: Record<string, number> = {};
    for (const c of deck) {
      const key = `${c.suit}${c.rank}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    for (const v of Object.values(counts)) expect(v).toBe(2);
  });

  it("total deck value = 240", () => {
    const total = doppelkopfDeck().reduce((s, c) => s + cardValue(c.rank), 0);
    expect(total).toBe(240);
  });
});

describe("Doppelkopf - isTrump", () => {
  it("all Queens are trump", () => {
    for (const s of ["♣", "♠", "♥", "♦"] as const) {
      expect(isTrump({ suit: s, rank: 12, id: "x" })).toBe(true);
    }
  });

  it("all Jacks are trump", () => {
    for (const s of ["♣", "♠", "♥", "♦"] as const) {
      expect(isTrump({ suit: s, rank: 11, id: "x" })).toBe(true);
    }
  });

  it("10♥ is trump", () => {
    expect(isTrump({ suit: "♥", rank: 10, id: "x" })).toBe(true);
  });

  it("all diamonds are trump", () => {
    for (const r of [1, 9, 10, 13] as const) {
      expect(isTrump({ suit: "♦", rank: r, id: "x" })).toBe(true);
    }
  });

  it("A♠ is NOT trump", () => {
    expect(isTrump({ suit: "♠", rank: 1, id: "x" })).toBe(false);
  });
});

describe("Doppelkopf - trumpOrder", () => {
  it("Q♣ is highest trump", () => {
    expect(trumpOrder({ suit: "♣", rank: 12, id: "x" })).toBeGreaterThan(trumpOrder({ suit: "♠", rank: 12, id: "x" }));
  });

  it("Jacks rank above diamonds but below queens", () => {
    expect(trumpOrder({ suit: "♣", rank: 11, id: "x" })).toBeLessThan(trumpOrder({ suit: "♦", rank: 12, id: "x" }));
    expect(trumpOrder({ suit: "♣", rank: 11, id: "x" })).toBeGreaterThan(trumpOrder({ suit: "♥", rank: 10, id: "x" }));
  });
});

describe("Doppelkopf - trickWinner", () => {
  it("Q♣ beats all other cards", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 12 as const, id: "qc" } },
      { seat: 1, card: { suit: "♦" as const, rank: 1 as const, id: "ad" } },
    ];
    expect(trickWinner(trick)).toBe(0);
  });

  it("higher trump wins", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 12 as const, id: "qs" } },
      { seat: 1, card: { suit: "♣" as const, rank: 12 as const, id: "qc" } },
    ];
    expect(trickWinner(trick)).toBe(1);
  });
});

describe("Doppelkopf - gameplay", () => {
  it("starts in playing phase with correct hand sizes", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
    state.hands.forEach(h => expect(h).toHaveLength(12));
  });

  it("teams have 2 members each", () => {
    const state = initialState(42);
    expect(state.teams[0]!.length + state.teams[1]!.length).toBe(4);
  });

  it("game eventually ends", () => {
    let state = initialState(5678);
    let iter = 0;
    while (state.phase !== "done" && iter < 200) {
      const hand = state.hands[0]!;
      if (hand.length === 0) break;
      let played = false;
      for (const card of hand) {
        const next = reducer(state, { type: "play", cardId: card.id });
        if (next !== state) { state = next; played = true; break; }
      }
      if (!played) break;
      iter++;
    }
    expect(state.phase).toBe("done");
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
