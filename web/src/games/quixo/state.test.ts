import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { QuixoSettings, QuixoState } from "./state.js";

const settings: QuixoSettings = { botStrength: "easy" };
const hardSettings: QuixoSettings = { botStrength: "hard" };

describe("Quixo initialState", () => {
  it("starts with all null cells", () => {
    const s = initialState(1, settings);
    expect(s.grid.every((c) => c === null)).toBe(true);
  });

  it("player X goes first", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("X");
    expect(s.gameOver).toBe(false);
  });
});

describe("Quixo reducer", () => {
  it("select marks the cell as selected", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", idx: 0 }); // top-left corner
    expect(s2.selected).toBe(0);
  });

  it("deselect when same cell clicked again", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", idx: 0 });
    const s3 = reducer(s2, { type: "select", idx: 0 });
    expect(s3.selected).toBeNull();
  });

  it("push right moves cell to end of row", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", idx: 0 }); // row 0, col 0
    const s3 = reducer(s2, { type: "push", dir: "right" });
    // Cell at row 0, col 4 should now be X
    expect(s3.grid[4]).toBe("X");
  });

  it("push down places X somewhere in column 0", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", idx: 0 }); // row 0, col 0
    const s3 = reducer(s2, { type: "push", dir: "down" });
    // After push, X should be at row 4 col 0 (idx 20) or bot may have shifted it
    // At minimum, an X must exist somewhere in column 0
    const col0 = [0, 5, 10, 15, 20].map((i) => s3.grid[i]);
    expect(col0).toContain("X");
  });

  it("cannot select an inner cell", () => {
    const s = initialState(1, settings);
    const inner = 12; // row 2, col 2 = center
    const s2 = reducer(s, { type: "select", idx: inner });
    expect(s2.selected).toBeNull();
  });

  it("winning condition detected", () => {
    // Fill row 0 with X manually
    const base = initialState(1, settings);
    const grid: ("X" | "O" | null)[] = [...base.grid] as ("X" | "O" | null)[];
    grid[0] = "X"; grid[1] = "X"; grid[2] = "X"; grid[3] = "X"; // row 0
    const s: QuixoState = { ...base, grid };
    // Select idx 4 (row 0, col 4) which is null and push left
    const s2 = reducer(s, { type: "select", idx: 4 });
    const s3 = reducer(s2, { type: "push", dir: "left" });
    expect(s3.winner).toBe("X");
    expect(s3.gameOver).toBe(true);
  });

  it("restart clears the grid", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", idx: 0 });
    const s3 = reducer(s2, { type: "push", dir: "right" });
    const s4 = reducer(s3, { type: "restart" });
    expect(s4.grid.every((c) => c === null)).toBe(true);
  });

  it("hard bot makes a move after player push", () => {
    const s = initialState(42, hardSettings);
    const s2 = reducer(s, { type: "select", idx: 0 });
    const s3 = reducer(s2, { type: "push", dir: "right" });
    // After player move, bot should have moved (some O appears)
    const hasO = s3.grid.some((c) => c === "O");
    expect(hasO).toBe(true);
  });
});

describe("Quixo isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns 100 on X win", () => {
    const base = initialState(1, settings);
    const won: QuixoState = { ...base, gameOver: true, winner: "X", winningLine: [0, 1, 2, 3, 4] };
    expect(isTerminal(won)!.score).toBe(100);
  });

  it("returns 0 on O win", () => {
    const base = initialState(1, settings);
    const lost: QuixoState = { ...base, gameOver: true, winner: "O", winningLine: [0, 5, 10, 15, 20] };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
