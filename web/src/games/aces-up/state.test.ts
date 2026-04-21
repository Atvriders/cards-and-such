import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findDiscardable } from "./state.js";
import type { AcesUpState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const SETTINGS = {};

describe("AcesUp initialState", () => {
  it("starts with 4 cards (one per column) and 48 in stock", () => {
    const s = initialState(42, SETTINGS);
    expect(s.columns.length).toBe(4);
    for (const col of s.columns) expect(col.length).toBe(1);
    expect(s.stock.length).toBe(48);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, SETTINGS);
    const s2 = initialState(7, SETTINGS);
    const ids1 = s1.columns.flat().map((c) => c.id).concat(s1.stock.map((c) => c.id)).join(",");
    const ids2 = s2.columns.flat().map((c) => c.id).concat(s2.stock.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });

  it("total cards is always 52", () => {
    const s = initialState(99, SETTINGS);
    const total = s.columns.reduce((sum, col) => sum + col.length, 0) + s.stock.length;
    expect(total).toBe(52);
  });

  it("discarded starts empty", () => {
    const s = initialState(42, SETTINGS);
    expect(s.discarded.length).toBe(0);
  });
});

describe("AcesUp reducer — deal", () => {
  it("deal adds 4 cards to columns", () => {
    const s = initialState(42, SETTINGS);
    const next = reducer(s, { type: "deal" });
    expect(next.columns.every((col) => col.length === 2)).toBe(true);
    expect(next.stock.length).toBe(44);
  });

  it("deal does nothing when stock is empty", () => {
    const s = initialState(42, SETTINGS);
    // Deal all 12 remaining times (48 remaining / 4 = 12)
    let cur = s;
    for (let i = 0; i < 12; i++) cur = reducer(cur, { type: "deal" });
    expect(cur.stock.length).toBe(0);
    const next = reducer(cur, { type: "deal" });
    expect(next.movesMade).toBe(cur.movesMade); // no change
  });
});

describe("AcesUp findDiscardable", () => {
  it("finds lower cards of same suit", () => {
    const makeCard = (suit: "♠" | "♥" | "♦" | "♣", rank: number, id: string): Card =>
      ({ suit, rank: rank as Card["rank"], id });
    const cols = [
      [makeCard("♠", 5, "a")],
      [makeCard("♠", 10, "b")],
      [makeCard("♥", 3, "c")],
      [makeCard("♦", 7, "d")],
    ];
    const discardable = findDiscardable(cols);
    expect(discardable).toContain(0); // 5♠ loses to 10♠
    expect(discardable).not.toContain(1); // 10♠ is highest
    expect(discardable).not.toContain(2); // only one ♥
    expect(discardable).not.toContain(3); // only one ♦
  });

  it("aces are treated as highest (rank 14)", () => {
    const makeCard = (suit: "♠" | "♥" | "♦" | "♣", rank: number, id: string): Card =>
      ({ suit, rank: rank as Card["rank"], id });
    const cols = [
      [makeCard("♠", 1, "ace")], // Ace = 14
      [makeCard("♠", 13, "king")], // King = 13
      [makeCard("♥", 2, "two")],
      [makeCard("♦", 7, "seven")],
    ];
    const discardable = findDiscardable(cols);
    expect(discardable).not.toContain(0); // Ace is highest
    expect(discardable).toContain(1); // King loses to Ace
  });
});

describe("AcesUp reducer — move-to-empty", () => {
  it("can move top card to empty column", () => {
    // Create a state where column 1 is empty
    const s = initialState(42, SETTINGS);
    const baseCol0 = s.columns[0]!;
    const modState: AcesUpState = {
      ...s,
      columns: [baseCol0, [], [...(s.columns[2] ?? [])], [...(s.columns[3] ?? [])]],
    };
    const next = reducer(modState, { type: "move-to-empty", fromCol: 0, toCol: 1 });
    expect(next.columns[0]!.length).toBe(baseCol0.length - 1);
    expect(next.columns[1]!.length).toBe(1);
  });

  it("cannot move to non-empty column", () => {
    const s = initialState(42, SETTINGS);
    const next = reducer(s, { type: "move-to-empty", fromCol: 0, toCol: 1 });
    // Both cols have 1 card — target is not empty, so no move
    expect(next.movesMade).toBe(0);
  });
});

describe("AcesUp isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, SETTINGS))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(42, SETTINGS);
    const wonState: AcesUpState = { ...s, won: true, score: 48 };
    expect(isTerminal(wonState)).toEqual({ score: 48 });
  });
});
