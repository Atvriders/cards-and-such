import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canBuildClock, clockTableauCanStack } from "./state.js";
import type { GrandfathersClockState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const settings = {};

describe("GrandFathersClock initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("has 12 clock foundations each with exactly 1 card", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 12; i++) {
      const f = s.piles.find((p) => p.id === `c${i}`)!;
      expect(f.kind).toBe("foundation");
      expect(f.cards.length).toBe(1);
    }
  });

  it("has 8 tableau columns of 5 cards each", () => {
    const s = initialState(5, settings);
    for (let i = 1; i <= 8; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.kind).toBe("tableau");
      expect(t.cards.length).toBe(5);
    }
  });

  it("clock foundation 12 has the ♠ King", () => {
    const s = initialState(42, settings);
    const c12 = s.piles.find((p) => p.id === "c12")!;
    expect(c12.cards[0]!.rank).toBe(13);
    expect(c12.cards[0]!.suit).toBe("♠");
  });
});

describe("GrandFathersClock canBuildClock", () => {
  it("allows building next rank in same suit", () => {
    const foundation: Pile = {
      id: "c1",
      kind: "foundation",
      cards: [{ id: "2h", suit: "♥", rank: 2 }],
    };
    expect(canBuildClock(foundation, { id: "3h", suit: "♥", rank: 3 })).toBe(true);
  });

  it("rejects wrong suit", () => {
    const foundation: Pile = {
      id: "c1",
      kind: "foundation",
      cards: [{ id: "2h", suit: "♥", rank: 2 }],
    };
    expect(canBuildClock(foundation, { id: "3s", suit: "♠", rank: 3 })).toBe(false);
  });

  it("wraps K→A", () => {
    const foundation: Pile = {
      id: "c12",
      kind: "foundation",
      cards: [{ id: "ks", suit: "♠", rank: 13 }],
    };
    expect(canBuildClock(foundation, { id: "as", suit: "♠", rank: 1 })).toBe(true);
  });

  it("rejects non-sequential rank", () => {
    const foundation: Pile = {
      id: "c1",
      kind: "foundation",
      cards: [{ id: "2h", suit: "♥", rank: 2 }],
    };
    expect(canBuildClock(foundation, { id: "5h", suit: "♥", rank: 5 })).toBe(false);
  });
});

describe("GrandFathersClock clockTableauCanStack", () => {
  it("allows placing a card one rank lower on tableau", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "8h", suit: "♥", rank: 8 }],
      faceUpCount: 1,
    };
    expect(clockTableauCanStack(target, [{ id: "7s", suit: "♠", rank: 7 }])).toBe(true);
    expect(clockTableauCanStack(target, [{ id: "7h", suit: "♥", rank: 7 }])).toBe(true); // any suit
  });

  it("allows any card on empty tableau", () => {
    const empty: Pile = { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(clockTableauCanStack(empty, [{ id: "5d", suit: "♦", rank: 5 }])).toBe(true);
  });

  it("rejects moving multiple cards", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "8h", suit: "♥", rank: 8 }],
      faceUpCount: 1,
    };
    expect(clockTableauCanStack(target, [
      { id: "7s", suit: "♠", rank: 7 },
      { id: "6s", suit: "♠", rank: 6 },
    ])).toBe(false);
  });
});

describe("GrandFathersClock reducer", () => {
  it("returns same state on illegal move", () => {
    const s = initialState(42, settings);
    // c1 is foundation; move from t1 to c1 is only valid if next rank matches
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1" });
    expect(next).toBe(s);
  });

  it("isTerminal returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("preserves total card count after any valid move", () => {
    const s = initialState(99, settings);
    // Find any valid tableau-to-tableau move
    for (const from of ["t1","t2","t3","t4","t5","t6","t7","t8"]) {
      for (const to of ["t1","t2","t3","t4","t5","t6","t7","t8"]) {
        if (from === to) continue;
        const fp = s.piles.find((p) => p.id === from)!;
        const tp = s.piles.find((p) => p.id === to)!;
        if (fp.cards.length === 0) continue;
        const card = fp.cards[fp.cards.length - 1]!;
        if (clockTableauCanStack(tp, [card])) {
          const next = reducer(s, { type: "move", fromPile: from, toPile: to });
          const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
          expect(total).toBe(52);
          return;
        }
      }
    }
  });
});
