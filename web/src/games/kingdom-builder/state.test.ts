import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TILES } from "./state.js";

describe("Kingdom Builder", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.tilesPlaced).toBe(0);
    expect(s.hand.length).toBe(3);
    expect(s.grid.length).toBe(25);
    expect(s.grid.every(c => c.tile === "empty")).toBe(true);
    expect(s.phase).toBe("place");
    expect(s.score).toBe(0);
  });

  it("placing a tile fills a cell and removes from hand", () => {
    const s = initialState(42);
    const tile = s.hand[0]!;
    const s2 = reducer(s, { type: "placeTile", cellIndex: 0, tile });
    expect(s2.grid[0]?.tile).toBe(tile);
    expect(s2.hand.length).toBe(3); // replacement drawn
    expect(s2.tilesPlaced).toBe(1);
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(42);
    const tile = s.hand[0]!;
    const s2 = reducer(s, { type: "placeTile", cellIndex: 0, tile });
    const tile2 = s2.hand[0]!;
    const s3 = reducer(s2, { type: "placeTile", cellIndex: 0, tile: tile2 });
    expect(s3.tilesPlaced).toBe(1); // no change
  });

  it("cannot place tile not in hand", () => {
    const s = initialState(42);
    // Use a tile type not in hand
    const tilesInHand = new Set(s.hand);
    const notInHand = (["castle","farm","forest","mine","village"] as const).find(t => !tilesInHand.has(t));
    if (!notInHand) return;
    const s2 = reducer(s, { type: "placeTile", cellIndex: 0, tile: notInHand });
    expect(s2.tilesPlaced).toBe(0);
  });

  it("score increases when placing tiles", () => {
    const s = initialState(42);
    const tile = s.hand[0]!;
    const s2 = reducer(s, { type: "placeTile", cellIndex: 0, tile });
    expect(s2.score).toBeGreaterThan(0);
  });

  it("discardAndDraw changes hand", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "discardAndDraw" });
    expect(s2.hand.length).toBe(3);
  });

  it("done phase after TOTAL_TILES placements", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TILES; i++) {
      if (s.phase === "done") break;
      const tile = s.hand[0]!;
      // find empty cell
      const cellIdx = s.grid.findIndex(c => c.tile === "empty");
      if (cellIdx < 0) break;
      s = reducer(s, { type: "placeTile", cellIndex: cellIdx, tile });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null when not done", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
