import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isChainConnected } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("GearPuzzle initialState", () => {
  it("creates valid state", () => {
    const s = initialState(0, easy);
    expect(s.slots.length).toBeGreaterThan(0);
    expect(s.won).toBe(false);
  });

  it("input and output slots have gears", () => {
    const s = initialState(0, easy);
    expect(s.slots[s.inputSlot]?.gear).not.toBeNull();
    expect(s.slots[s.outputSlot]?.gear).not.toBeNull();
  });

  it("hard difficulty has larger grid", () => {
    const s = initialState(0, hard);
    expect(s.cols).toBeGreaterThanOrEqual(4);
  });

  it("available gears list is populated", () => {
    const s = initialState(0, easy);
    expect(s.availableGears.length).toBeGreaterThan(0);
  });
});

describe("isChainConnected", () => {
  it("detects direct adjacency", () => {
    const slots = [
      { col: 0, row: 0, gear: "large" as const, fixed: true },
      { col: 1, row: 0, gear: "small" as const, fixed: true },
    ];
    expect(isChainConnected(slots, 2, 1, 0, 1)).toBe(true);
  });

  it("returns false when gap exists", () => {
    const slots = [
      { col: 0, row: 0, gear: "large" as const, fixed: true },
      { col: 1, row: 0, gear: null, fixed: false },
      { col: 2, row: 0, gear: "small" as const, fixed: true },
    ];
    expect(isChainConnected(slots, 3, 1, 0, 2)).toBe(false);
  });

  it("works with path through chain", () => {
    const slots = [
      { col: 0, row: 0, gear: "large" as const, fixed: true },
      { col: 1, row: 0, gear: "small" as const, fixed: false },
      { col: 2, row: 0, gear: "large" as const, fixed: true },
    ];
    expect(isChainConnected(slots, 3, 1, 0, 2)).toBe(true);
  });

  it("returns false if output has no gear", () => {
    const slots = [
      { col: 0, row: 0, gear: "large" as const, fixed: true },
      { col: 1, row: 0, gear: null, fixed: false },
    ];
    expect(isChainConnected(slots, 2, 1, 0, 1)).toBe(false);
  });
});

describe("GearPuzzle reducer", () => {
  it("places gear in empty slot", () => {
    const s = initialState(0, easy);
    const emptyIdx = s.slots.findIndex(slot => !slot.fixed && slot.gear === null);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "placeGear", slotIndex: emptyIdx });
      expect(s2.slots[emptyIdx]?.gear).toBe(s.selectedGear);
    }
  });

  it("removes placed gear", () => {
    const s = initialState(0, easy);
    const emptyIdx = s.slots.findIndex(slot => !slot.fixed && slot.gear === null);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "placeGear", slotIndex: emptyIdx });
      const s3 = reducer(s2, { type: "removeGear", slotIndex: emptyIdx });
      expect(s3.slots[emptyIdx]?.gear).toBeNull();
    }
  });

  it("cannot remove fixed gear", () => {
    const s = initialState(0, easy);
    const s2 = reducer(s, { type: "removeGear", slotIndex: s.inputSlot });
    expect(s2).toBe(s);
  });

  it("no-op when won", () => {
    const s = { ...initialState(0, easy), won: true };
    const s2 = reducer(s, { type: "placeGear", slotIndex: 1 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, easy), won: true, moves: 5 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
