import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s4 = { size: "4" as const };
const s6 = { size: "6" as const };

describe("Treasure Hunt", () => {
  it("initializes with all cells hidden", () => {
    const s = initialState(42, s4);
    expect(s.grid.every(c => c === "hidden")).toBe(true);
    expect(s.digs).toBe(0);
    expect(s.found).toBe(false);
    expect(s.size).toBe(4);
  });

  it("6x6 grid has 36 cells", () => {
    const s = initialState(42, s6);
    expect(s.grid.length).toBe(36);
  });

  it("digging the treasure cell sets found=true", () => {
    const s = initialState(42, s4);
    const next = reducer(s, { type: "dig", index: s.treasureIndex });
    expect(next.found).toBe(true);
    expect(next.grid[s.treasureIndex]).toBe("treasure");
    expect(next.digs).toBe(1);
  });

  it("digging a non-treasure cell reveals a hint", () => {
    const s = initialState(42, s4);
    const nonTreasure = s.grid.findIndex((_, i) => i !== s.treasureIndex);
    const next = reducer(s, { type: "dig", index: nonTreasure });
    expect(["empty", "warm", "hot"]).toContain(next.grid[nonTreasure]);
    expect(next.found).toBe(false);
  });

  it("re-digging an already dug cell shows a message", () => {
    const s = initialState(42, s4);
    const nonTreasure = s.grid.findIndex((_, i) => i !== s.treasureIndex);
    let cur = reducer(s, { type: "dig", index: nonTreasure });
    const before = cur.digs;
    cur = reducer(cur, { type: "dig", index: nonTreasure });
    expect(cur.digs).toBe(before); // no extra dig counted
  });

  it("isTerminal returns null when not found", () => {
    const s = initialState(42, s4);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns a score when found", () => {
    const s = initialState(42, s4);
    const next = reducer(s, { type: "dig", index: s.treasureIndex });
    const terminal = isTerminal(next);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBeGreaterThan(0);
  });

  it("actions after found are ignored", () => {
    const s = initialState(42, s4);
    const found = reducer(s, { type: "dig", index: s.treasureIndex });
    const after = reducer(found, { type: "dig", index: 0 });
    expect(after).toBe(found);
  });
});
