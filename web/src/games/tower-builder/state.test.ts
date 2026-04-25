import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, MAX_LEVELS, PLATFORM_WIDTH } from "./state.js";

describe("Tower Builder", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.level).toBe(1);
    expect(s.stackHeight).toBe(0);
    expect(s.phase).toBe("swing");
    expect(s.currentBlock.width).toBe(PLATFORM_WIDTH);
  });

  it("tick moves the swinging block when width is less than platform", () => {
    // After a drop, block is trimmed, so it can swing
    const s = initialState(42);
    // Simulate a small block to allow swing
    const s2 = { ...s, currentBlock: { x: 0, width: 100 } };
    const s3 = reducer(s2, { type: "tick" });
    // With width 100 and maxEdge=100, newPos=8 < 100, so swingPos should advance
    expect(s3.swingPos).toBe(8);
  });

  it("drop trims block to overlap and scores points", () => {
    // Perfect drop: swingPos = 0 means perfect alignment on base block at x=0
    const s = { ...initialState(42), swingPos: 0, currentBlock: { x: 0, width: PLATFORM_WIDTH } };
    const s2 = reducer(s, { type: "drop" });
    expect(s2.phase).toBe("placed");
    expect(s2.score).toBe(PLATFORM_WIDTH);
    expect(s2.stackHeight).toBe(1);
  });

  it("drop with no overlap ends game", () => {
    const s = {
      ...initialState(42),
      currentBlock: { x: 150, width: PLATFORM_WIDTH },
      blocks: [{ x: 0, width: 50 }],
    };
    // overlap region: max(150, 0)=150 to min(350, 50)=50 => 50-150 < 0 => fell off
    const s2 = reducer(s, { type: "drop" });
    expect(s2.phase).toBe("done");
  });

  it("nextLevel advances level after placed", () => {
    const s = { ...initialState(42), phase: "placed" as const };
    const s2 = reducer(s, { type: "nextLevel" });
    expect(s2.phase).toBe("swing");
  });

  it("isTerminal null when not done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("completing MAX_LEVELS ends the game", () => {
    let s = initialState(42);
    for (let i = 0; i < MAX_LEVELS; i++) {
      if (s.phase === "done") break;
      s = { ...s, swingPos: 0, currentBlock: { ...s.currentBlock, x: 0 } };
      s = reducer(s, { type: "drop" });
      if (s.phase === "placed") s = reducer(s, { type: "nextLevel" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score is capped at 100", () => {
    const s = { ...initialState(42), phase: "done" as const, score: 999999 };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
