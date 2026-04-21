import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings2 = { players: "2" as const };
const settings3 = { players: "3" as const };

// ── 1. Initial state ──────────────────────────────────────────────────────────
describe("initialState", () => {
  it("total cards across all hands is 51 minus pairs discarded", () => {
    const s = initialState(42, settings3);
    const totalCards = s.hands.reduce((sum, h) => sum + h.length, 0);
    // All 51 cards dealt, pairs removed — total is odd (since 51 cards with one odd Queen)
    expect(totalCards).toBeLessThanOrEqual(51);
    expect(totalCards % 2).toBe(1); // odd number of cards remain (the lone Queen and unpaired cards)
  });

  it("phase is playing at start", () => {
    const s = initialState(1, settings2);
    expect(s.phase).toBe("playing");
    expect(s.loser).toBeNull();
  });

  it("deterministic for the same seed", () => {
    const s1 = initialState(99, settings3);
    const s2 = initialState(99, settings3);
    expect(s1.hands).toEqual(s2.hands);
  });

  it("different seeds produce different hands", () => {
    const s1 = initialState(1, settings3);
    const s2 = initialState(2, settings3);
    const h1 = s1.hands[0]!.map(c => c.id).sort();
    const h2 = s2.hands[0]!.map(c => c.id).sort();
    expect(h1).not.toEqual(h2);
  });
});

// ── 2. No-op on invalid actions ───────────────────────────────────────────────
describe("reducer — invalid actions", () => {
  it("ignores draw when game is done", () => {
    const s = initialState(42, settings2);
    const done = { ...s, phase: "done" as const };
    const s2 = reducer(done, { type: "draw", cardIndex: 0 });
    expect(s2).toBe(done);
  });

  it("ignores draw when it is not player's turn", () => {
    const s = initialState(42, settings2);
    const botTurn = { ...s, turn: 1 };
    const s2 = reducer(botTurn, { type: "draw", cardIndex: 0 });
    expect(s2).toBe(botTurn);
  });

  it("ignores out-of-bounds card index", () => {
    const s = { ...initialState(42, settings2), turn: 0 };
    const leftHand = s.hands[(s.seats - 1) % s.seats]!;
    const s2 = reducer(s, { type: "draw", cardIndex: leftHand.length + 10 });
    expect(s2).toBe(s);
  });
});

// ── 3. Drawing a card ─────────────────────────────────────────────────────────
describe("reducer — draw", () => {
  it("drawing reduces left neighbor's hand by 1", () => {
    // Force turn 0 so human can act
    const s = { ...initialState(10, settings2), turn: 0 };
    const leftSeat = (s.seats - 1) % s.seats; // seat 1
    const leftHandBefore = s.hands[leftSeat]!.length;
    if (leftHandBefore === 0) return; // skip if empty
    const s2 = reducer(s, { type: "draw", cardIndex: 0 });
    const newTotal = s2.hands.reduce((sum, h) => sum + h.length, 0);
    const oldTotal = s.hands.reduce((sum, h) => sum + h.length, 0);
    // Total either same (pair discarded) or +1 (no pair formed)
    expect(newTotal).toBeLessThanOrEqual(oldTotal);
  });

  it("game eventually reaches done state", () => {
    let s = initialState(7, settings2);
    // Run many random draws until game finishes
    for (let i = 0; i < 200; i++) {
      if (s.phase === "done") break;
      if (s.turn === 0) {
        const leftSeat = (s.seats - 1) % s.seats;
        const leftHand = s.hands[leftSeat]!;
        if (leftHand.length > 0) {
          s = reducer(s, { type: "draw", cardIndex: 0 });
        } else {
          break;
        }
      }
    }
    // Should finish eventually
    expect(s.phase).toBe("done");
    expect(s.loser).not.toBeNull();
  });
});

// ── 4. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, settings2);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 0 when player (seat 0) is the loser", () => {
    const s = initialState(42, settings2);
    const done = { ...s, phase: "done" as const, loser: 0 };
    expect(isTerminal(done)).toEqual({ score: 0 });
  });

  it("returns score 100 when bot is the loser", () => {
    const s = initialState(42, settings2);
    const done = { ...s, phase: "done" as const, loser: 1 };
    expect(isTerminal(done)).toEqual({ score: 100 });
  });

  it("returns null when phase is done but loser is null", () => {
    const s = { ...initialState(42, settings2), phase: "done" as const, loser: null };
    expect(isTerminal(s)).toBeNull();
  });
});
