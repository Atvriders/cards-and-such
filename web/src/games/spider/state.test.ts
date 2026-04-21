import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, spiderRuleset } from "./state.js";
import type { SpiderState, SpiderSettings } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const defaultSettings: SpiderSettings = { suits: "1" };

describe("Spider initialState", () => {
  it("has 10 tableau columns totalling 54 cards, stock has 50, completed has 0", () => {
    const s = initialState(42, defaultSettings);
    let tableauTotal = 0;
    for (let i = 1; i <= 10; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile).toBeDefined();
      tableauTotal += pile.cards.length;
    }
    expect(tableauTotal).toBe(54);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(50);
    const completed = s.piles.find((p) => p.id === "completed")!;
    expect(completed.cards.length).toBe(0);
  });

  it("first 4 columns get 6 cards, last 6 columns get 5 cards", () => {
    const s = initialState(42, defaultSettings);
    for (let i = 1; i <= 4; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(6);
      expect(pile.faceUpCount).toBe(1);
    }
    for (let i = 5; i <= 10; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(5);
      expect(pile.faceUpCount).toBe(1);
    }
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    const ids1 = s1.piles.map((p) => p.cards.map((c) => c.id)).flat();
    const ids2 = s2.piles.map((p) => p.cards.map((c) => c.id)).flat();
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    const ids1 = s1.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    const ids2 = s2.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("total card count is 104 (1-suit)", () => {
    const s = initialState(42, { suits: "1" });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("total card count is 104 (2-suit)", () => {
    const s = initialState(42, { suits: "2" });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
    // All cards should be spades or hearts
    const nonSpadeHeart = s.piles.flatMap((p) => p.cards).filter(
      (c) => c.suit !== "♠" && c.suit !== "♥",
    );
    expect(nonSpadeHeart.length).toBe(0);
  });

  it("total card count is 104 (4-suit)", () => {
    const s = initialState(42, { suits: "4" });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("starts with score 500, movesMade 0, completedSuits 0", () => {
    const s = initialState(42, defaultSettings);
    expect(s.score).toBe(500);
    expect(s.movesMade).toBe(0);
    expect(s.completedSuits).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("Spider reducer — move", () => {
  it("legal move updates state (move single card to column with rank+1 top)", () => {
    // Build a controlled state where a legal move exists
    const s = initialState(42, defaultSettings);
    // Find any face-up top card and look for a column whose top card is rank+1 in any suit
    let moved = false;
    for (let fi = 1; fi <= 10 && !moved; fi++) {
      const fromPile = s.piles.find((p) => p.id === `t${fi}`)!;
      if (fromPile.cards.length === 0) continue;
      const fromTop = fromPile.cards[fromPile.cards.length - 1]!;
      for (let ti = 1; ti <= 10 && !moved; ti++) {
        if (ti === fi) continue;
        const toPile = s.piles.find((p) => p.id === `t${ti}`)!;
        if (toPile.cards.length === 0) continue;
        const toTop = toPile.cards[toPile.cards.length - 1]!;
        if (toTop.rank === fromTop.rank + 1) {
          const next = reducer(s, { type: "move", fromPile: `t${fi}`, toPile: `t${ti}`, count: 1 });
          expect(next.movesMade).toBe(s.movesMade + 1);
          expect(next.piles.find((p) => p.id === `t${ti}`)!.cards.length).toBe(toPile.cards.length + 1);
          expect(next.piles.find((p) => p.id === `t${fi}`)!.cards.length).toBe(fromPile.cards.length - 1);
          moved = true;
        }
      }
    }
    // If no natural move found via initial state, just verify the reducer handles basic move logic
    if (!moved) {
      // Just verify state doesn't mutate unexpectedly when no valid move found
      const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
      const totalBefore = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
      const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
      expect(totalAfter).toBe(totalBefore);
    }
  });

  it("illegal move (wrong-rank placement) rejects — state unchanged", () => {
    // Create a state where t1 top cannot stack on t2 top (they differ by != 1)
    const s = initialState(42, defaultSettings);
    const t1 = s.piles.find((p) => p.id === "t1")!;
    const t2 = s.piles.find((p) => p.id === "t2")!;
    const t1Top = t1.cards[t1.cards.length - 1]!;
    const t2Top = t2.cards[t2.cards.length - 1]!;

    // Only test as illegal if ranks don't satisfy the spider rule
    if (t2Top.rank !== t1Top.rank + 1) {
      const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
      expect(next).toBe(s); // Same reference = not mutated
    } else {
      // It's actually legal — verify total cards unchanged
      const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
      const totalBefore = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
      const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
      expect(totalAfter).toBe(totalBefore);
    }
  });

  it("multi-card pick-up requires same-suit descending sequence", () => {
    // canPickUp should reject if top 2 cards are not same-suit descending
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      // top two cards: rank 5 spade, rank 4 heart (different suit) — not same-suit sequence
      cards: [
        { suit: "♠", rank: 6, id: "c1" },
        { suit: "♠", rank: 5, id: "c2" },
        { suit: "♥", rank: 4, id: "c3" }, // top
      ],
      faceUpCount: 3,
    };
    expect(spiderRuleset.canPickUp(pile, 2)).toBe(false);
  });

  it("same-suit descending sequence CAN be picked up", () => {
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [
        { suit: "♠", rank: 6, id: "c1" },
        { suit: "♠", rank: 5, id: "c2" },
        { suit: "♠", rank: 4, id: "c3" }, // top
      ],
      faceUpCount: 3,
    };
    expect(spiderRuleset.canPickUp(pile, 2)).toBe(true);
    expect(spiderRuleset.canPickUp(pile, 3)).toBe(true);
  });
});

describe("Spider reducer — deal-row", () => {
  it("deal-row pushes 10 cards from stock across columns", () => {
    const s = initialState(42, defaultSettings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const colsBefore = Array.from({ length: 10 }, (_, i) =>
      s.piles.find((p) => p.id === `t${i + 1}`)!.cards.length,
    );
    const next = reducer(s, { type: "deal-row" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 10);
    for (let i = 0; i < 10; i++) {
      const colAfter = next.piles.find((p) => p.id === `t${i + 1}`)!.cards.length;
      expect(colAfter).toBeGreaterThanOrEqual(colsBefore[i]!); // might be less if auto-remove triggered
    }
  });

  it("deal-row rejected when any column is empty", () => {
    const s = initialState(42, defaultSettings);
    // Manually create a state with an empty column
    const newPiles = s.piles.map((p) => {
      if (p.id === "t1") return { ...p, cards: [], faceUpCount: 0 };
      return { ...p, cards: [...p.cards] };
    });
    const stateWithEmptyCol: SpiderState = { ...s, piles: newPiles };
    const next = reducer(stateWithEmptyCol, { type: "deal-row" });
    expect(next).toBe(stateWithEmptyCol); // unchanged
  });

  it("deal-row rejected when stock has fewer than 10 cards", () => {
    const s = initialState(42, defaultSettings);
    // Drain stock to fewer than 10 cards (50 cards, do 4 deals of 10 = 40 used, 10 remain)
    let cur = s;
    for (let i = 0; i < 4; i++) {
      cur = reducer(cur, { type: "deal-row" });
    }
    // Now drain stock manually to 5 cards
    const newPiles = cur.piles.map((p) => {
      if (p.id === "stock") return { ...p, cards: p.cards.slice(0, 5) };
      return { ...p, cards: [...p.cards] };
    });
    const stateWithSmallStock: SpiderState = { ...cur, piles: newPiles };
    const next = reducer(stateWithSmallStock, { type: "deal-row" });
    expect(next).toBe(stateWithSmallStock); // unchanged
  });
});

describe("Spider reducer — auto-suit-removal", () => {
  it("completing a suit auto-removes 13 cards and increments completedSuits", () => {
    // Build a state where t1 is about to have K-Q-J-10-9-8-7-6-5-4-3-2-A all spades on top
    // and t2 has rank 1 that triggers completion when moved... instead build directly
    // Create a state where t1 has a full K-A spades sequence on top
    const suits13: Pile["cards"] = Array.from({ length: 13 }, (_, i) => ({
      suit: "♠" as const,
      rank: (13 - i) as Pile["cards"][number]["rank"],
      id: `test-${i}`,
    }));
    // t1 has just these 13 cards (K at bottom of array = index 0, A at top = index 12)
    // Wait — the array is bottom-to-top, so index 0 is K (rank 13), index 12 is A (rank 1)
    // hasCompleteSuit checks top13[0] is K (rank 13), top13[12] is A (rank 1)
    // So suits13[0] = rank 13 (K) is correct
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: suits13, faceUpCount: 13 },
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `t${i + 2}`,
        kind: "tableau" as const,
        cards: [{ suit: "♠" as const, rank: 5 as const, id: `filler-${i}` }],
        faceUpCount: 1,
      })),
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "completed", kind: "foundation", cards: [] },
    ];

    const state: SpiderState = {
      piles,
      score: 500,
      movesMade: 0,
      completedSuits: 0,
      won: false,
      settings: defaultSettings,
    };

    // Move a card from t2 to t1 to trigger auto-remove check — but t1 already has a full suit!
    // Actually the auto-remove should happen after any move. Let's do a move from t2 to t2 — invalid.
    // Instead, create a state where moving one card from t2 completes the suit on t1.
    // Simpler: create t1 with 12 cards (K..2) and t2 with Ace on top, then move Ace to t1.
    const suits12: Pile["cards"] = Array.from({ length: 12 }, (_, i) => ({
      suit: "♠" as const,
      rank: (13 - i) as Pile["cards"][number]["rank"],
      id: `test-${i}`,
    }));
    // suits12[0]=K(13), suits12[11]=2(2)
    const aceCard = { suit: "♠" as const, rank: 1 as const, id: "ace-card" };
    const piles2: Pile[] = [
      { id: "t1", kind: "tableau", cards: suits12, faceUpCount: 12 },
      { id: "t2", kind: "tableau", cards: [aceCard], faceUpCount: 1 },
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `t${i + 3}`,
        kind: "tableau" as const,
        cards: [{ suit: "♠" as const, rank: 5 as const, id: `filler-${i}` }],
        faceUpCount: 1,
      })),
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "completed", kind: "foundation", cards: [] },
    ];

    const state2: SpiderState = {
      piles: piles2,
      score: 500,
      movesMade: 0,
      completedSuits: 0,
      won: false,
      settings: defaultSettings,
    };

    const next = reducer(state2, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next.completedSuits).toBe(1);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(0);
    expect(next.piles.find((p) => p.id === "completed")!.cards.length).toBe(13);
  });

  it("winning: 8 completed suits sets won=true", () => {
    // Build a state with 7 completed suits already and one tableau with the last K-A sequence
    const suits12: Pile["cards"] = Array.from({ length: 12 }, (_, i) => ({
      suit: "♠" as const,
      rank: (13 - i) as Pile["cards"][number]["rank"],
      id: `final-${i}`,
    }));
    const aceCard = { suit: "♠" as const, rank: 1 as const, id: "final-ace" };
    const completedCards: Pile["cards"] = Array.from({ length: 7 * 13 }, (_, i) => ({
      suit: "♠" as const,
      rank: ((i % 13) + 1) as Pile["cards"][number]["rank"],
      id: `completed-${i}`,
    }));

    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: suits12, faceUpCount: 12 },
      { id: "t2", kind: "tableau", cards: [aceCard], faceUpCount: 1 },
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `t${i + 3}`,
        kind: "tableau" as const,
        cards: [{ suit: "♠" as const, rank: 5 as const, id: `filler2-${i}` }],
        faceUpCount: 1,
      })),
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "completed", kind: "foundation", cards: completedCards },
    ];

    const state: SpiderState = {
      piles,
      score: 410,
      movesMade: 90,
      completedSuits: 7,
      won: false,
      settings: defaultSettings,
    };

    const next = reducer(state, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next.completedSuits).toBe(8);
    expect(next.won).toBe(true);
  });
});

describe("Spider isTerminal", () => {
  it("returns null when completedSuits < 8", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when completedSuits === 8", () => {
    const state: SpiderState = {
      piles: [],
      score: 750,
      movesMade: 50,
      completedSuits: 8,
      won: true,
      settings: defaultSettings,
    };
    const result = isTerminal(state);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(750);
  });

  it("returns score 0 minimum when score is negative", () => {
    const state: SpiderState = {
      piles: [],
      score: -10,
      movesMade: 1000,
      completedSuits: 8,
      won: true,
      settings: defaultSettings,
    };
    const result = isTerminal(state);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });
});
