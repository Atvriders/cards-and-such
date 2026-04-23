import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CuckooState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<CuckooState> = {}): CuckooState {
  return {
    settings,
    rngSeed: 1,
    hands: [makeCard("♣", 5, "c5"), makeCard("♥", 8, "h8"), makeCard("♦", 9, "d9"), makeCard("♠", 7, "s7")],
    lives: [3, 3, 3, 3],
    stock: [],
    phase: "player-turn",
    turn: 0,
    swapped: [false, false, false, false],
    roundMsg: "",
    revealedHands: [null, null, null, null],
    round: 1,
    ...overrides,
  };
}

// ── 1. initialState ─────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals one card to each of 4 players", () => {
    const s = initialState(42, settings);
    expect(s.hands.length).toBe(4);
    expect(s.hands.every(h => h !== null)).toBe(true);
  });

  it("starts with 3 lives for each player", () => {
    const s = initialState(42, settings);
    expect(s.lives).toEqual([3, 3, 3, 3]);
  });

  it("phase starts as player-turn", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("player-turn");
  });

  it("same seed yields same initial hands", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.hands[0]?.id).toBe(s2.hands[0]?.id);
  });
});

// ── 2. Keep action ───────────────────────────────────────────────────────────

describe("keep action", () => {
  it("player keeps card and phase becomes reveal", () => {
    const s = baseState();
    const after = reducer(s, { type: "keep" });
    expect(after.phase).toBe("reveal");
  });

  it("player card unchanged after keep", () => {
    const s = baseState();
    const after = reducer(s, { type: "keep" });
    expect(after.revealedHands[0]?.id).toBe("c5"); // lowest card kept
  });
});

// ── 3. Swap action ───────────────────────────────────────────────────────────

describe("swap action", () => {
  it("player swaps card with bot1", () => {
    const s = baseState();
    const after = reducer(s, { type: "swap" });
    // After swap: player should have h8 (bot1's card), bot1 should have c5
    expect(after.revealedHands[0]?.id).toBe("h8");
  });

  it("swap blocked if bot1 holds King", () => {
    const s = baseState({
      hands: [makeCard("♣", 5, "c5"), makeCard("♠", 13, "sK"), makeCard("♦", 9, "d9"), makeCard("♥", 7, "h7")],
    });
    const after = reducer(s, { type: "swap" });
    // swap refused — player keeps c5
    expect(after.revealedHands[0]?.id).toBe("c5");
  });
});

// ── 4. Life loss ──────────────────────────────────────────────────────────────

describe("life loss", () => {
  it("lowest-card player loses a life", () => {
    // player has rank 2 (lowest), bots have higher ranks
    const s = baseState({
      hands: [makeCard("♣", 2, "c2"), makeCard("♥", 8, "h8"), makeCard("♦", 9, "d9"), makeCard("♠", 7, "s7")],
    });
    const after = reducer(s, { type: "keep" });
    expect(after.lives[0]).toBe(2); // player lost a life
    expect(after.lives[1]).toBe(3);
  });

  it("isTerminal returns null during active game", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 0 when player has 0 lives in reveal", () => {
    const s = baseState({
      phase: "reveal",
      lives: [0, 3, 3, 3],
      revealedHands: [makeCard("♣", 2, "c2"), null, null, null],
    });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("isTerminal returns 100 when a bot is dead and player survived", () => {
    const s = baseState({
      phase: "reveal",
      lives: [3, 0, 3, 3],
      revealedHands: [makeCard("♣", 2, "c2"), null, null, null],
    });
    expect(isTerminal(s)?.score).toBe(100);
  });
});
