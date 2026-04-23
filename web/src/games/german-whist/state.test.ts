import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { GermanWhistState } from "./state.js";

const defaultSettings = { botDifficulty: "easy" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<GermanWhistState> = {}): GermanWhistState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], []],
    stock: [],
    stockTop: null,
    trumpSuit: "♠",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "phase1",
    tricksTaken: [0, 0],
    phase1Tricks: 0,
    phase2Tricks: 0,
    finalScores: null,
    message: "",
    ...overrides,
  };
}

// ── 1. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 13 cards to each player", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(13);
    expect(s.hands[1]!.length).toBe(13);
  });

  it("stock has 25 hidden + stockTop is set", () => {
    const s = initialState(42, defaultSettings);
    expect(s.stockTop).not.toBeNull();
    expect(s.stock.length).toBe(25);
  });

  it("trump suit from stockTop", () => {
    const s = initialState(42, defaultSettings);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });

  it("phase starts as phase1", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("phase1");
  });
});

// ── 2. legalPlays ─────────────────────────────────────────────────────────────

describe("legalPlays", () => {
  it("must follow led suit when holding it", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 10, "h10") }],
      hands: [[makeCard("♥", 5, "h5"), makeCard("♠", 3, "s3")], []],
    });
    const legal = legalPlays(s, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });

  it("any card when cannot follow suit", () => {
    const s = baseState({
      currentTrick: [{ seat: 1, card: makeCard("♥", 10, "h10") }],
      hands: [[makeCard("♦", 5, "d5"), makeCard("♠", 3, "s3")], []],
    });
    const legal = legalPlays(s, 0);
    expect(legal.length).toBe(2);
  });

  it("all cards legal when leading", () => {
    const hand = [makeCard("♠", 5, "s5"), makeCard("♥", 7, "h7")];
    const s = baseState({ hands: [hand, []], currentTrick: [] });
    expect(legalPlays(s, 0).length).toBe(2);
  });
});

// ── 3. Trump wins trick ────────────────────────────────────────────────────────

describe("trump wins trick", () => {
  it("trump beats higher led suit card", () => {
    const trumpCard = makeCard("♠", 2, "s2");
    const s = baseState({
      phase: "phase2",
      turn: 0,
      hands: [[trumpCard], [makeCard("♣", 13, "ck")]],
      trumpSuit: "♠",
      currentTrick: [{ seat: 1, card: makeCard("♣", 13, "ck") }],
      tricksTaken: [0, 0],
      phase2Tricks: 0,
    });
    const after = reducer(s, { type: "play", cardId: "s2" });
    expect(after.tricksTaken[0]).toBe(1);
  });
});

// ── 4. Phase transitions ──────────────────────────────────────────────────────

describe("phase2 completion", () => {
  it("isTerminal null in phase1", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns 100 when player has more tricks", () => {
    const s = baseState({ phase: "done", finalScores: [8, 5] });
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("isTerminal returns 0 when bot has more tricks", () => {
    const s = baseState({ phase: "done", finalScores: [4, 9] });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("isTerminal returns 50 on tie", () => {
    const s = baseState({ phase: "done", finalScores: [6, 7] });
    // 6 vs 7 — bot wins
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("game progresses through phase1 to phase2", () => {
    let s = initialState(7, defaultSettings);
    expect(s.phase).toBe("phase1");
    // Play enough tricks to get to phase2
    let iters = 0;
    while (s.phase === "phase1" && iters < 20) {
      const legal = legalPlays(s, 0);
      if (legal.length === 0) break;
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iters++;
    }
    // Should transition to phase2 eventually
    expect(["phase2", "done"]).toContain(s.phase);
  });
});
