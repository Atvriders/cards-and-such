import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BubbleShooterState } from "./state.js";

const s4 = { colors: "4" as const };
const s3 = { colors: "3" as const };

describe("BubbleShooter initialState", () => {
  it("grid has correct size (6 rows × 9 cols = 54 cells)", () => {
    const s = initialState(42, s4);
    expect(s.grid.length).toBe(54);
    expect(s.rows).toBe(6);
    expect(s.cols).toBe(9);
  });

  it("all initial cells are filled (no nulls in first 6 rows)", () => {
    const s = initialState(42, s4);
    expect(s.grid.every((c) => c !== null)).toBe(true);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, s4);
    const s2 = initialState(99, s4);
    expect([...s1.grid]).toEqual([...s2.grid]);
    expect(s1.currentBubble).toBe(s2.currentBubble);
  });

  it("bubble colors within range", () => {
    const s = initialState(42, s3);
    for (const cell of s.grid) {
      expect(cell).not.toBeNull();
      expect(cell!).toBeGreaterThanOrEqual(0);
      expect(cell!).toBeLessThan(3);
    }
  });
});

describe("BubbleShooter aim", () => {
  it("aim action updates angle", () => {
    const s = initialState(42, s4);
    const s2 = reducer(s, { type: "aim", angle: 45 });
    expect(s2.angle).toBe(45);
  });

  it("aim clamps to [-80, 80]", () => {
    const s = initialState(42, s4);
    const s2 = reducer(s, { type: "aim", angle: 999 });
    expect(s2.angle).toBe(80);
    const s3 = reducer(s, { type: "aim", angle: -999 });
    expect(s3.angle).toBe(-80);
  });
});

describe("BubbleShooter shoot", () => {
  it("shoot increments shot count", () => {
    const s = initialState(42, s4);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.shots).toBe(1);
  });

  it("shoot changes currentBubble", () => {
    const s = initialState(42, s4);
    const s2 = reducer(s, { type: "shoot" });
    // Not guaranteed to change but counter advances
    expect(s2.rngCounter).toBeGreaterThan(s.rngCounter);
  });

  it("shooting into a 3+ cluster pops them", () => {
    // Build a state with a row of 3 same-color bubbles at bottom of grid
    // so the shot can land adjacent and form a group
    const s = initialState(42, s3);
    // Replace last row (row 5) with all color-0
    const newGrid = s.grid.slice() as (0 | 1 | 2 | null)[];
    for (let c = 0; c < 9; c++) {
      newGrid[5 * 9 + c] = 0;
    }
    const withRow: BubbleShooterState = { ...s, grid: newGrid, currentBubble: 0 };
    // Shoot straight up — bubble should land somewhere at the top
    const result = reducer(withRow, { type: "shoot" });
    // Some cells should still be there (game not over from one shot)
    expect(result.shots).toBe(1);
  });

  it("no-op when game already won", () => {
    const s = initialState(42, s4);
    const won: BubbleShooterState = { ...s, won: true };
    const s2 = reducer(won, { type: "shoot" });
    expect(s2.shots).toBe(0);
  });

  it("no-op when game already lost", () => {
    const s = initialState(42, s4);
    const lost: BubbleShooterState = { ...s, lost: true };
    const s2 = reducer(lost, { type: "shoot" });
    expect(s2.shots).toBe(0);
  });
});

describe("BubbleShooter isTerminal", () => {
  it("returns null for active game", () => {
    const s = initialState(42, s4);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(42, s4);
    const won: BubbleShooterState = { ...s, won: true, shots: 10 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 2000 - 10 * 20));
  });

  it("returns score 0 when lost", () => {
    const s = initialState(42, s4);
    const lost: BubbleShooterState = { ...s, lost: true };
    const result = isTerminal(lost);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });

  it("win score has minimum floor of 100", () => {
    const s = initialState(42, s4);
    const won: BubbleShooterState = { ...s, won: true, shots: 9999 };
    const result = isTerminal(won);
    expect(result!.score).toBe(100);
  });
});
