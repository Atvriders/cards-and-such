import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  nextRequired,
  valueMatches,
  type SkipBoFullSettings,
  type SkipBoFullState,
  type CardObj,
} from "./state.js";

const S: SkipBoFullSettings = { cpuCount: 3, stockSize: 30 };

function findHandCardWithValue(state: SkipBoFullState, seat: number, value: number): number {
  const sb = state.seats[seat]!;
  return sb.hand.findIndex((c) => c && c.value === value);
}

function setHandSlot(state: SkipBoFullState, seat: number, idx: number, card: CardObj | null): SkipBoFullState {
  const sb = state.seats[seat]!;
  const newHand = [...sb.hand];
  newHand[idx] = card;
  const newSeats = state.seats.map((b, i) => (i === seat ? { ...b, hand: newHand } : b));
  return { ...state, seats: newSeats };
}

describe("skip-bo-full / initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.seats[0]!.stock.map((c) => c.value)).toEqual(b.seats[0]!.stock.map((c) => c.value));
    expect(a.seats[0]!.hand.map((c) => c?.value ?? null)).toEqual(b.seats[0]!.hand.map((c) => c?.value ?? null));
    expect(a.draw.length).toBe(b.draw.length);
  });

  it("produces different deals for different seeds", () => {
    const a = initialState(1, S);
    const b = initialState(2, S);
    const seqA = a.seats[0]!.stock.map((c) => c.value).join(",");
    const seqB = b.seats[0]!.stock.map((c) => c.value).join(",");
    expect(seqA).not.toBe(seqB);
  });

  it("uses 30-card stockpile and 5-card hand by default", () => {
    const s = initialState(7, S);
    expect(s.seats[0]!.stock.length).toBe(30);
    expect(s.seats[0]!.hand.length).toBe(5);
    expect(s.seats[0]!.hand.filter((c) => c !== null).length).toBe(5);
  });

  it("uses 162-card deck (30*4 + 5*4 + draw = 162)", () => {
    const s = initialState(11, S);
    const totalCards =
      s.seats.reduce((sum, b) => sum + b.stock.length + b.hand.filter((c) => c !== null).length + b.discards.reduce((a, p) => a + p.length, 0), 0) +
      s.draw.length +
      s.completed.length +
      s.buildPiles.reduce((a, p) => a + p.length, 0);
    expect(totalCards).toBe(162);
  });

  it("starts in playing phase with no winner", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.winner).toBeNull();
    expect(s.turn).toBe(0);
  });

  it("respects cpuCount setting (only seats 0..cpuCount get cards)", () => {
    const s = initialState(3, { cpuCount: 1, stockSize: 30 });
    expect(s.seats[0]!.stock.length).toBe(30);
    expect(s.seats[1]!.stock.length).toBe(30);
    expect(s.seats[2]!.stock.length).toBe(0);
    expect(s.seats[3]!.stock.length).toBe(0);
  });
});

describe("skip-bo-full / helpers", () => {
  it("nextRequired starts at 1 and increments with pile length", () => {
    expect(nextRequired([])).toBe(1);
    expect(nextRequired([{ id: "x", value: 1 }])).toBe(2);
  });
  it("valueMatches treats 0 (Skip-Bo) as any value", () => {
    expect(valueMatches(0, 1)).toBe(true);
    expect(valueMatches(0, 12)).toBe(true);
    expect(valueMatches(3, 3)).toBe(true);
    expect(valueMatches(3, 4)).toBe(false);
  });
});

describe("skip-bo-full / isTerminal", () => {
  it("returns null on a fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("returns score 100+bonus when human wins", () => {
    let s = initialState(1, S);
    s = { ...s, phase: "done", winner: 0 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });

  it("returns score 0 when CPU wins", () => {
    let s = initialState(1, S);
    s = { ...s, phase: "done", winner: 1 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});

describe("skip-bo-full / reducer legal moves", () => {
  it("playing a hand card that does not match returns the same state reference", () => {
    let s = initialState(5, S);
    // Force a known mismatch: put a 7 in hand slot 0, require 1 on every build pile
    s = setHandSlot(s, 0, 0, { id: "test-7", value: 7 });
    const after = reducer(s, { type: "play", source: { kind: "hand", index: 0 }, buildIndex: 0 });
    expect(after).toBe(s);
  });

  it("playing a matching hand card removes it and advances the build pile", () => {
    let s = initialState(5, S);
    s = setHandSlot(s, 0, 0, { id: "test-1", value: 1 });
    const before = s.seats[0]!.hand[0];
    expect(before?.value).toBe(1);
    const after = reducer(s, { type: "play", source: { kind: "hand", index: 0 }, buildIndex: 0 });
    expect(after).not.toBe(s);
    expect(after.buildPiles[0]!.length).toBe(1);
    expect(after.buildPiles[0]![0]!.value).toBe(1);
    expect(after.seats[0]!.hand[0]).toBeNull();
  });

  it("Skip-Bo wild from hand plays as the next required value", () => {
    let s = initialState(9, S);
    s = setHandSlot(s, 0, 1, { id: "test-wild", value: 0 });
    const after = reducer(s, { type: "play", source: { kind: "hand", index: 1 }, buildIndex: 2 });
    expect(after.buildPiles[2]!.length).toBe(1);
    expect(after.buildPiles[2]![0]!.value).toBe(1); // wild becomes 1
  });

  it("discarding from hand ends the human's turn and advances to a CPU seat", () => {
    let s = initialState(13, S);
    const handCount0 = s.seats[0]!.hand.filter((c) => c !== null).length;
    expect(handCount0).toBe(5);
    const idx = s.seats[0]!.hand.findIndex((c) => c !== null);
    const after = reducer(s, { type: "discard", handIndex: idx, discardIndex: 0 });
    expect(after.turn).not.toBe(0);
    expect(after.seats[0]!.discards[0]!.length).toBe(1);
  });

  it("cpuStep on human's turn returns same state", () => {
    const s = initialState(2, S);
    const after = reducer(s, { type: "cpuStep" });
    expect(after).toBe(s);
  });

  it("after a discard, the CPU eventually runs and refills its hand", () => {
    let s = initialState(17, S);
    const idx = s.seats[0]!.hand.findIndex((c) => c !== null);
    s = reducer(s, { type: "discard", handIndex: idx, discardIndex: 1 });
    expect(s.turn).toBe(1);
    // Walk CPUs through until it comes back to human (or game ends).
    let safety = 200;
    while (s.turn !== 0 && s.phase === "playing" && safety-- > 0) {
      s = reducer(s, { type: "cpuStep" });
    }
    // CPUs should have advanced something (some build pile is non-empty, or
    // someone has discards).
    const anyProgress =
      s.buildPiles.some((p) => p.length > 0) ||
      s.seats.some((b, i) => i !== 0 && b.discards.some((d) => d.length > 0));
    expect(anyProgress).toBe(true);
  });

  it("CPU eventually returns control to the human (no deadlock)", () => {
    let s = initialState(21, S);
    const idx = s.seats[0]!.hand.findIndex((c) => c !== null);
    s = reducer(s, { type: "discard", handIndex: idx, discardIndex: 0 });
    let safety = 300;
    while (s.turn !== 0 && s.phase === "playing" && safety-- > 0) {
      s = reducer(s, { type: "cpuStep" });
    }
    expect(s.turn === 0 || s.phase === "done").toBe(true);
  });

  it("game ends with positive score when human's stock is forced to 0 by a play", () => {
    // Construct a contrived state: stock has exactly one card matching build pile 0's required value.
    let s = initialState(29, S);
    s = {
      ...s,
      seats: s.seats.map((b, i) =>
        i === 0 ? { ...b, stock: [{ id: "lastcard", value: 1 }] } : b,
      ),
      buildPiles: [[], [], [], []],
    };
    const after = reducer(s, { type: "play", source: { kind: "stock" }, buildIndex: 0 });
    expect(after.phase).toBe("done");
    expect(after.winner).toBe(0);
    const t = isTerminal(after);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });

  it("a build pile completing at 12 clears it and adds to completed recycle", () => {
    let s = initialState(33, S);
    // Pre-load build pile 0 with cards 1..11
    const prefilled: CardObj[] = Array.from({ length: 11 }, (_v, i) => ({ id: `pre-${i}`, value: i + 1 }));
    s = { ...s, buildPiles: [prefilled, [], [], []] };
    // Put a 12 in hand
    s = setHandSlot(s, 0, 0, { id: "twelve", value: 12 });
    const after = reducer(s, { type: "play", source: { kind: "hand", index: 0 }, buildIndex: 0 });
    expect(after.buildPiles[0]!.length).toBe(0);
    expect(after.completed.length).toBe(12);
  });
});
