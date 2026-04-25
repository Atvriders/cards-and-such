import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Precedence initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.stock.length + s.waste.length +
      s.reserve.filter(Boolean).length;
    expect(total).toBe(52);
  });

  it("stock starts with all 52 cards", () => {
    const s = initialState(1);
    expect(s.stock.length).toBe(52);
  });

  it("foundations and reserve start empty", () => {
    const s = initialState(5);
    for (const f of s.foundations) expect(f.length).toBe(0);
    expect(s.reserve.filter(Boolean).length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    expect(s1.stock.map(c => c.id).join(",")).toBe(s2.stock.map(c => c.id).join(","));
  });
});

describe("Precedence reducer", () => {
  it("draw moves top stock to waste", () => {
    const s = initialState(42);
    const topCard = s.stock[s.stock.length - 1]!;
    const next = reducer(s, { type: "draw" });
    expect(next.waste[next.waste.length - 1]!.id).toBe(topCard.id);
    expect(next.stock.length).toBe(51);
  });

  it("waste-to-reserve parks card", () => {
    const s = initialState(42);
    const drawn = reducer(s, { type: "draw" });
    const card = drawn.waste[0]!;
    const next = reducer(drawn, { type: "waste-to-reserve", reserveIdx: 0 });
    expect(next.reserve[0]?.id).toBe(card.id);
    expect(next.waste.length).toBe(0);
  });

  it("redeal flips waste to stock", () => {
    let s = initialState(42);
    for (let i = 0; i < 52; i++) s = reducer(s, { type: "draw" });
    expect(s.stock.length).toBe(0);
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBeGreaterThan(0);
    expect(next.waste.length).toBe(0);
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});
