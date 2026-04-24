import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("DoubleFreeCell initialState", () => {
  it("has exactly 104 cards", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("has 10 cascades with correct sizes", () => {
    const s = initialState(5);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `c${i}`)!.cards.length).toBe(11);
    }
    for (let i = 5; i <= 10; i++) {
      expect(s.piles.find((p) => p.id === `c${i}`)!.cards.length).toBe(10);
    }
  });

  it("has 6 empty free cells", () => {
    const s = initialState(5);
    for (let i = 1; i <= 6; i++) {
      const fc = s.piles.find((p) => p.id === `fc${i}`)!;
      expect(fc.cards.length).toBe(0);
    }
  });

  it("has 8 empty foundations", () => {
    const s = initialState(5);
    for (let i = 1; i <= 8; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });

  it("different seeds differ", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    const flat1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const flat2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(flat1).not.toBe(flat2);
  });
});

describe("DoubleFreeCell reducer", () => {
  it("can move to free cell", () => {
    const s = initialState(42);
    const c1 = s.piles.find((p) => p.id === "c1")!;
    const beforeLen = c1.cards.length;
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 1 });
    expect(next.piles.find((p) => p.id === "c1")!.cards.length).toBe(beforeLen - 1);
    expect(next.piles.find((p) => p.id === "fc1")!.cards.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("invalid move returns same state", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 0 });
    expect(next).toBe(s);
  });

  it("total cards conserved after moves", () => {
    let s = initialState(42);
    s = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 1 });
    s = reducer(s, { type: "move", fromPile: "c2", toPile: "fc2", count: 1 });
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("won is false initially", () => {
    const s = initialState(42);
    expect(s.won).toBe(false);
    expect(isTerminal(s)).toBeNull();
  });
});
