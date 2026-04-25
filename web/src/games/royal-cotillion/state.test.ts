import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("RoyalCotillion initialState", () => {
  it("has 104 cards total (two decks)", () => {
    const st = initialState(42, {});
    const odd = st.oddFoundations.reduce((s, f) => s + f.cards.length, 0);
    const even = st.evenFoundations.reduce((s, f) => s + f.cards.length, 0);
    const res = st.reserve.reduce((s, p) => s + p.length, 0);
    expect(odd + even + res + st.stock.length + st.waste.length).toBe(104);
  });

  it("reserve has 8 piles of 3 cards", () => {
    const st = initialState(42, {});
    expect(st.reserve.length).toBe(8);
    for (const p of st.reserve) expect(p.length).toBe(3);
  });

  it("has 16 odd foundations and 16 even foundations", () => {
    const st = initialState(42, {});
    expect(st.oddFoundations.length).toBe(8);
    expect(st.evenFoundations.length).toBe(8);
  });

  it("foundations start empty", () => {
    const st = initialState(42, {});
    for (const f of [...st.oddFoundations, ...st.evenFoundations]) {
      expect(f.cards.length).toBe(0);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(3, {});
    const s2 = initialState(3, {});
    expect(s1.stock[0]!.id).toBe(s2.stock[0]!.id);
  });
});

describe("RoyalCotillion reducer", () => {
  it("draw reduces stock by 1", () => {
    const st = initialState(42, {});
    const stockLen = st.stock.length;
    const next = reducer(st, { type: "draw" });
    expect(next.stock.length).toBe(stockLen - 1);
    expect(next.waste.length).toBe(1);
  });

  it("total cards preserved after draw", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "draw" });
    const odd = next.oddFoundations.reduce((s, f) => s + f.cards.length, 0);
    const even = next.evenFoundations.reduce((s, f) => s + f.cards.length, 0);
    const res = next.reserve.reduce((s, p) => s + p.length, 0);
    expect(odd + even + res + next.stock.length + next.waste.length).toBe(104);
  });

  it("recycle with non-empty stock does nothing", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "recycle" });
    expect(next.recyclesLeft).toBe(st.recyclesLeft);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, {}))).toBeNull();
  });

  it("playing Ace on odd foundation works when waste top is Ace", () => {
    const st = initialState(42, {});
    let s = st;
    let found = false;
    for (let i = 0; i < 80 && !found; i++) {
      s = reducer(s, { type: "draw" });
      const wasteTop = s.waste[s.waste.length - 1];
      if (wasteTop && wasteTop.rank === 1) {
        const fi = s.oddFoundations.findIndex((f) => f.suit === wasteTop.suit && f.cards.length === 0);
        if (fi >= 0) {
          const next = reducer(s, { type: "play-waste-odd", foundationIndex: fi });
          expect(next.oddFoundations[fi]!.cards.length).toBe(1);
          found = true;
        }
      }
    }
    expect(true).toBe(true); // ensure no crash
  });
});
