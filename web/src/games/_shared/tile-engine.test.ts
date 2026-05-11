import { describe, expect, it } from "vitest";
import {
  DEFAULT_TILE_CONFIG,
  type TileConfig,
  adjacencyScore,
  clusterBonusScore,
  initialTileState,
  neighborsOf,
  tileBestMoveIndex,
  tileHintSelector,
  tileIsTerminal,
  tileReducer,
  totalScore,
} from "./tile-engine.js";

describe("tile-engine", () => {
  it("scores adjacency, cluster bonuses, and respects grid edges", () => {
    // 2x2 grid: top row both type 0, bottom row both type 1.
    // Pairs of matching neighbors: (top-left, top-right) and (bottom-left, bottom-right).
    // adjacencyPts=2 => 2 pairs * 2 = 4. Cluster bonus: two clusters of size>=2 => 2*7=14.
    const cfg: TileConfig = {
      gridSize: 2,
      totalTiles: 4,
      numTypes: 2,
      adjacencyPts: 2,
      clusterBonus: [{ size: 2, pts: 7 }],
    };
    const cells = [0, 0, 1, 1];
    expect(adjacencyScore(cells, cfg)).toBe(4);
    expect(clusterBonusScore(cells, cfg)).toBe(14);
    expect(totalScore(cells, cfg)).toBe(18);

    // Corner neighbor sanity: index 0 on 2x2 grid has neighbors right(1) and down(2) only.
    expect(neighborsOf(0, 2).sort()).toEqual([1, 2]);
    // Center cell on 3x3 grid has 4 neighbors.
    expect(neighborsOf(4, 3).sort()).toEqual([1, 3, 5, 7]);
  });

  it("reducer places tiles, updates score, ignores invalid moves, and terminates", () => {
    // Deterministic 2x2 game with a fixed queue via pre-seeded state assembly.
    const cfg: TileConfig = {
      gridSize: 2,
      totalTiles: 4,
      numTypes: 1, // every tile is type 0 -> guaranteed adjacency
      adjacencyPts: 3,
      completionBonus: 11,
    };
    let s = initialTileState(123, cfg);
    expect(s.cells).toEqual([-1, -1, -1, -1]);
    expect(s.queue.length).toBe(4);
    expect(s.queue.every((t) => t === 0)).toBe(true);
    expect(s.phase).toBe("playing");

    // Place at index 0.
    s = tileReducer(s, { type: "place", index: 0 });
    expect(s.cells[0]).toBe(0);
    expect(s.placed).toBe(1);

    // Re-placing on occupied cell is a no-op (returns same state reference).
    const sameState = tileReducer(s, { type: "place", index: 0 });
    expect(sameState).toBe(s);
    // Out-of-bounds index is also a no-op.
    expect(tileReducer(s, { type: "place", index: 99 })).toBe(s);

    // Best-move hint should pick an empty neighbor of the placed tile (index 1 or 2).
    const hint = tileBestMoveIndex(s);
    expect([1, 2]).toContain(hint);
    const sel = tileHintSelector(s, "tile-grid");
    expect(sel).toBe(`.tile-grid > button:nth-child(${(hint as number) + 1})`);

    // Fill remaining cells.
    s = tileReducer(s, { type: "place", index: 1 });
    s = tileReducer(s, { type: "place", index: 2 });
    s = tileReducer(s, { type: "place", index: 3 });

    expect(s.phase).toBe("done");
    expect(s.placed).toBe(4);
    // 2x2 all-same: 4 adjacent pairs * 3 adjacencyPts = 12, plus completionBonus 11 = 23.
    expect(s.score).toBe(23);
    expect(tileIsTerminal(s)).toEqual({ score: 23 });
    // Further actions after done are ignored.
    expect(tileReducer(s, { type: "place", index: 0 })).toBe(s);
    // No best move once full.
    expect(tileBestMoveIndex(s)).toBeNull();
    expect(tileHintSelector(s, "tile-grid")).toBeNull();
  });

  it("default config and pre-placed tiles initialize correctly", () => {
    const s = initialTileState(42);
    expect(s.config).toBe(DEFAULT_TILE_CONFIG);
    expect(s.cells.length).toBe(DEFAULT_TILE_CONFIG.gridSize ** 2);
    expect(s.queue.length).toBe(DEFAULT_TILE_CONFIG.totalTiles);
    expect(s.cells.every((c) => c === -1)).toBe(true);

    const cfg: TileConfig = {
      gridSize: 3,
      totalTiles: 1,
      numTypes: 2,
      prePlaced: [{ index: 4, type: 1 }],
    };
    const s2 = initialTileState(7, cfg);
    expect(s2.cells[4]).toBe(1);
    expect(s2.placed).toBe(0); // pre-placed don't count toward placed
  });
});
