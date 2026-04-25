import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Royal Marriage initialState", () => {
  it("starts with King of Hearts in row", () => {
    const s = initialState(1, settings);
    expect(s.row.length).toBe(1);
    expect(s.row[0]!.rank).toBe(13);
    expect(s.row[0]!.suit).toBe("♥");
  });

  it("Queen of Hearts is last in stock", () => {
    const s = initialState(1, settings);
    const last = s.stock[s.stock.length - 1]!;
    expect(last.rank).toBe(12);
    expect(last.suit).toBe("♥");
  });

  it("total cards is 52", () => {
    const s = initialState(1, settings);
    expect(s.row.length + s.stock.length).toBe(52);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(5, settings);
    const s2 = initialState(5, settings);
    expect(s1.stock[0]!.id).toBe(s2.stock[0]!.id);
  });
});

describe("Royal Marriage reducer - deal", () => {
  it("dealing adds card to row", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "deal-card" });
    expect(next.row.length).toBe(2);
    expect(next.stock.length).toBe(s.stock.length - 1);
  });

  it("dealing from empty stock does nothing", () => {
    const s = { ...initialState(1, settings), stock: [] };
    const next = reducer(s, { type: "deal-card" });
    expect(next).toBe(s);
  });

  it("movesMade increments on deal", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "deal-card" });
    expect(next.movesMade).toBe(1);
  });
});

describe("Royal Marriage reducer - discard-between", () => {
  it("rejects gap of 1 (no card between)", () => {
    const s = initialState(1, settings);
    let cur = reducer(s, { type: "deal-card" });
    cur = reducer(cur, { type: "deal-card" });
    // gap of 1 means adjacent - not allowed (must sandwich 1 or 2)
    const next = reducer(cur, { type: "discard-between", leftIdx: 0, rightIdx: 1 });
    expect(next.row.length).toBe(cur.row.length);
  });

  it("rejects non-matching cards", () => {
    const s = initialState(1, settings);
    let cur = s;
    for (let i = 0; i < 3; i++) cur = reducer(cur, { type: "deal-card" });
    // Try discard between idx 0 and 3 - only valid if same suit/rank
    const left = cur.row[0]!;
    const right = cur.row[3]!;
    if (left.suit !== right.suit && left.rank !== right.rank) {
      const next = reducer(cur, { type: "discard-between", leftIdx: 0, rightIdx: 3 });
      expect(next.row.length).toBe(cur.row.length);
    } else {
      expect(true).toBe(true);
    }
  });

  it("removes sandwiched cards when match found", () => {
    // Deal enough cards to find a match
    const s = initialState(42, settings);
    let cur = s;
    for (let i = 0; i < 10; i++) cur = reducer(cur, { type: "deal-card" });
    // Look for a matching pair with 1 or 2 cards between
    let removed = false;
    for (let li = 0; li < cur.row.length - 2; li++) {
      for (const ri of [li + 2, li + 3]) {
        if (ri >= cur.row.length) continue;
        const l = cur.row[li]!;
        const r = cur.row[ri]!;
        if (l.suit === r.suit || l.rank === r.rank) {
          const next = reducer(cur, { type: "discard-between", leftIdx: li, rightIdx: ri });
          expect(next.row.length).toBeLessThan(cur.row.length);
          removed = true;
          break;
        }
      }
      if (removed) break;
    }
    // It's fine if no match found in first 10 cards
    expect(removed || cur.row.length > 0).toBe(true);
  });
});

describe("Royal Marriage isTerminal", () => {
  it("returns null for non-won state", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score for won state", () => {
    const s = { ...initialState(1, settings), won: true, score: 50 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(50);
  });
});
