import { describe, expect, it } from "vitest";
import { unoInitial, unoReduce, unoTerminal } from "@cards/shared";

describe("uno-like reducer", () => {
  it("deals 7 cards per player for 2-4 players", () => {
    for (const seats of [2, 3, 4]) {
      const s = unoInitial(42, seats);
      expect(s.hands).toHaveLength(seats);
      s.hands.forEach((h) => expect(h).toHaveLength(7));
    }
  });

  it("is deterministic under same seed", () => {
    const a = unoInitial(7, 3);
    const b = unoInitial(7, 3);
    expect(a.hands[0]!.map((c) => c.id)).toEqual(b.hands[0]!.map((c) => c.id));
  });

  it("rejects action when not your turn", () => {
    const s = unoInitial(1, 2);
    const bad = unoReduce(s, { type: "draw" }, 1);
    expect(bad).toBe(s);
  });

  it("draw adds a card to hand", () => {
    const s = unoInitial(1, 2);
    const next = unoReduce(s, { type: "draw" }, 0);
    expect(next.hands[0]!.length).toBeGreaterThan(s.hands[0]!.length);
  });

  it("terminal returns winner + score", () => {
    const s = unoInitial(1, 2);
    const won = { ...s, winner: 1 as const };
    expect(unoTerminal(won)).toEqual({ winner: 1, score: 100 });
  });
});
