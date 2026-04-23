import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, canCapture } from "./state.js";
import type { BastraState } from "./state.js";

const settings = { placeholder: "none" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function baseState(overrides: Partial<BastraState> = {}): BastraState {
  return {
    settings,
    rngSeed: 1,
    hands: [[makeCard("♣", 5, "c5"), makeCard("♥", 8, "h8")], [makeCard("♦", 3, "d3")]],
    table: [makeCard("♠", 5, "s5"), makeCard("♦", 7, "d7")],
    stock: [],
    captured: [[], []],
    bastras: [0, 0],
    phase: "playing",
    turn: 0,
    scores: [0, 0],
    message: "",
    lastCapture: 0,
    ...overrides,
  };
}

// ── 1. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 4 cards each and 4 on table", () => {
    const s = initialState(42, settings);
    expect(s.hands[0]!.length).toBe(4);
    expect(s.hands[1]!.length).toBe(4);
    expect(s.table.length).toBe(4);
  });

  it("stock has 40 cards (52 - 4 - 4 - 4)", () => {
    const s = initialState(42, settings);
    expect(s.stock.length).toBe(40);
  });

  it("starts on player turn", () => {
    const s = initialState(42, settings);
    expect(s.turn).toBe(0);
    expect(s.phase).toBe("playing");
  });
});

// ── 2. canCapture ─────────────────────────────────────────────────────────────

describe("canCapture", () => {
  it("same rank match works", () => {
    const hand = makeCard("♣", 7, "c7");
    const table = [makeCard("♠", 7, "s7")];
    expect(canCapture(hand, table)).toBe(true);
  });

  it("sum match works", () => {
    const hand = makeCard("♣", 9, "c9");
    const t1 = makeCard("♠", 4, "s4");
    const t2 = makeCard("♥", 5, "h5");
    expect(canCapture(hand, [t1, t2])).toBe(true);
  });

  it("empty table cards returns false", () => {
    const hand = makeCard("♣", 5, "c5");
    expect(canCapture(hand, [])).toBe(false);
  });

  it("mismatched rank and sum returns false", () => {
    const hand = makeCard("♣", 5, "c5");
    const table = [makeCard("♠", 7, "s7")];
    expect(canCapture(hand, table)).toBe(false);
  });
});

// ── 3. Capture action ─────────────────────────────────────────────────────────

describe("capture action", () => {
  it("valid capture removes table cards and hand card", () => {
    const s = baseState();
    const after = reducer(s, { type: "capture", handCardId: "c5", tableCardIds: ["s5"] });
    expect(after.table).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "s5" })]));
    expect(after.hands[0]).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "c5" })]));
  });

  it("captured cards go to player pile", () => {
    const s = baseState();
    const after = reducer(s, { type: "capture", handCardId: "c5", tableCardIds: ["s5"] });
    expect(after.captured[0]!.length).toBeGreaterThan(0);
  });

  it("bastra scored when clearing all table cards", () => {
    const s = baseState({
      table: [makeCard("♠", 5, "s5")], // only 1 card on table
      hands: [[makeCard("♣", 5, "c5")], [makeCard("♦", 3, "d3")]],
    });
    const after = reducer(s, { type: "capture", handCardId: "c5", tableCardIds: ["s5"] });
    expect(after.bastras[0]).toBe(1);
  });
});

// ── 4. Trail action ───────────────────────────────────────────────────────────

describe("trail action", () => {
  it("trailing adds card to table (before bot plays)", () => {
    // Use a state where bot has no cards to capture to keep test simple
    const s = baseState({
      hands: [[makeCard("♣", 5, "c5"), makeCard("♥", 8, "h8")], []],
      table: [makeCard("♠", 7, "d7")],
    });
    const before = s.table.length;
    const after = reducer(s, { type: "trail", handCardId: "c5" });
    // After trail and bot with empty hand, table grows by 1
    expect(after.table.length).toBe(before + 1);
  });

  it("trailed card removed from hand", () => {
    const s = baseState();
    const after = reducer(s, { type: "trail", handCardId: "c5" });
    expect(after.hands[0]).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "c5" })]));
  });
});

// ── 5. isTerminal ─────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("null during play", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("player wins when score higher", () => {
    const s = baseState({ phase: "done", scores: [15, 5] });
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("player loses when score lower", () => {
    const s = baseState({ phase: "done", scores: [3, 20] });
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("tie gives 50", () => {
    const s = baseState({ phase: "done", scores: [10, 10] });
    expect(isTerminal(s)?.score).toBe(50);
  });
});
