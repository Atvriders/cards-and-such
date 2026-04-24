import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS } from "./state.js";

describe("Mine Delver", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(1);
    expect(s.playerRow).toBe(-1);
    expect(s.gold).toBe(0);
    expect(s.playerHp).toBe(25);
    expect(s.phase).toBe("digging");
    expect(s.grid.length).toBe(ROWS);
    expect(s.grid[0]!.length).toBe(COLS);
  });

  it("digging into row 0 moves player to row 0", () => {
    const s = initialState(1);
    // find a non-monster tile in row 0
    const safeCol = s.grid[0]!.findIndex(t => t.type !== "monster" && t.type !== "lava");
    if (safeCol < 0) return;
    const s2 = reducer(s, { type: "dig", col: safeCol });
    expect(s2.playerRow).toBe(0);
  });

  it("ore tile increases gold", () => {
    const s = initialState(42);
    const oreCol = s.grid[0]!.findIndex(t => t.type === "ore");
    if (oreCol < 0) return;
    const s2 = reducer(s, { type: "dig", col: oreCol });
    expect(s2.gold).toBeGreaterThan(0);
  });

  it("monster tile deals damage", () => {
    const s = initialState(42);
    const monCol = s.grid[0]!.findIndex(t => t.type === "monster");
    if (monCol < 0) return;
    const s2 = reducer(s, { type: "dig", col: monCol });
    expect(s2.playerHp).toBeLessThan(s.playerHp);
  });

  it("isTerminal null during digging", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal score when escaped", () => {
    const s = { ...initialState(1), phase: "escaped" as const, gold: 30, depth: 9 };
    const r = isTerminal(s);
    expect(r!.score).toBe(50 + 30 + 9 * 5);
  });

  it("isTerminal score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, gold: 10, depth: 4 };
    const r = isTerminal(s);
    expect(r!.score).toBe(10 + 4 * 3);
  });

  it("lava deals 10 damage", () => {
    const s = initialState(1);
    // Force a lava tile at row 0 col 0
    const newGrid = s.grid.map((row, r) => row.map((t, c) =>
      r === 0 && c === 0 ? { type: "lava" as const, revealed: true } : t
    ));
    const modState = { ...s, grid: newGrid };
    const s2 = reducer(modState, { type: "dig", col: 0 });
    expect(s2.playerHp).toBe(15);
  });
});
