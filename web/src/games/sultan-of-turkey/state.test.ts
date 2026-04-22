import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canBuildOnFoundation, SULTAN_ID } from "./state.js";
import type { SultanState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const settings = {};

describe("SultanOfTurkey initialState", () => {
  it("has 4 kings on foundations at start", () => {
    const s = initialState(42, settings);
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    const totalKings = foundations.reduce(
      (sum, f) => sum + f.cards.filter((c) => c.rank === 13).length,
      0
    );
    expect(totalKings).toBe(4);
  });

  it("Sultan foundation (f5) has the ♥ King", () => {
    const s = initialState(42, settings);
    const sultan = s.piles.find((p) => p.id === SULTAN_ID)!;
    expect(sultan.cards.length).toBeGreaterThan(0);
    expect(sultan.cards[0]!.rank).toBe(13);
    expect(sultan.cards[0]!.suit).toBe("♥");
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });

  it("total cards in stock + waste + piles = 52", () => {
    const s = initialState(42, settings);
    const pileTotal = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(pileTotal + s.stock.length + s.waste.length).toBe(52);
  });

  it("reserve columns each have exactly 1 card at start", () => {
    const s = initialState(42, settings);
    for (const rid of ["r1","r2","r3","r4"]) {
      const r = s.piles.find((p) => p.id === rid)!;
      expect(r.cards.length).toBe(1);
    }
  });
});

describe("SultanOfTurkey canBuildOnFoundation", () => {
  it("rejects build on Sultan foundation", () => {
    const sultanPile: Pile = {
      id: SULTAN_ID,
      kind: "foundation",
      cards: [{ id: "kh", suit: "♥", rank: 13 }],
    };
    expect(canBuildOnFoundation(sultanPile, { id: "ah", suit: "♥", rank: 1 })).toBe(false);
  });

  it("Ace goes on King in same suit (K→A wrap)", () => {
    const foundation: Pile = {
      id: "f1",
      kind: "foundation",
      cards: [{ id: "ks", suit: "♠", rank: 13 }],
    };
    expect(canBuildOnFoundation(foundation, { id: "as", suit: "♠", rank: 1 })).toBe(true);
  });

  it("wrong suit is rejected", () => {
    const foundation: Pile = {
      id: "f1",
      kind: "foundation",
      cards: [{ id: "ks", suit: "♠", rank: 13 }],
    };
    expect(canBuildOnFoundation(foundation, { id: "ah", suit: "♥", rank: 1 })).toBe(false);
  });

  it("2 goes on Ace on same suit foundation", () => {
    const foundation: Pile = {
      id: "f1",
      kind: "foundation",
      cards: [
        { id: "ks", suit: "♠", rank: 13 },
        { id: "as", suit: "♠", rank: 1 },
      ],
    };
    expect(canBuildOnFoundation(foundation, { id: "2s", suit: "♠", rank: 2 })).toBe(true);
  });
});

describe("SultanOfTurkey reducer", () => {
  it("draw flips stock to waste", () => {
    const s = initialState(42, settings);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
    expect(next.waste.length).toBe(1);
  });

  it("redeal when stock is empty", () => {
    const s = initialState(42, settings);
    // Draw all stock
    let cur: SultanState = s;
    while (cur.stock.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.waste.length).toBeGreaterThan(0);
    // One more draw = redeal
    const redealt = reducer(cur, { type: "draw" });
    expect(redealt.stock.length).toBeGreaterThan(0);
    expect(redealt.waste.length).toBe(0);
  });

  it("play-waste to valid foundation increases score", () => {
    // Build a state where waste top matches a foundation
    const s = initialState(42, settings);
    // Find which suit needs Ace next; find a foundation with just King
    let cur: SultanState = s;
    let played = false;
    for (let i = 0; i < 50 && !played; i++) {
      cur = reducer(cur, { type: "draw" });
      const top = cur.waste[cur.waste.length - 1];
      if (!top) break;
      for (const fid of ["f1","f2","f3","f4"]) {
        const fp = cur.piles.find((p) => p.id === fid)!;
        if (canBuildOnFoundation(fp, top)) {
          const before = cur.score;
          const next = reducer(cur, { type: "play-waste", toPile: fid });
          expect(next.score).toBe(before + 10);
          played = true;
          break;
        }
      }
    }
    // If no such move found, just verify state is unchanged after bad play
    if (!played) {
      const next = reducer(cur, { type: "play-waste", toPile: "f1" });
      expect(next.score).toBe(cur.score); // no change if invalid
    }
  });

  it("isTerminal returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});

import { canBuildOnFoundation as cbf } from "./state.js";
export { cbf };
