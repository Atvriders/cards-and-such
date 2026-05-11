import { describe, expect, it } from "vitest";
import {
  buildTiles,
  isFree,
  hasMatchingPair,
  findHintTileId,
  mahjongHint,
  makeInitialState,
  reducer,
  isTerminal,
  TILE_FACES,
  type TilePos,
} from "./mahjongEngine.js";

/** A simple flat 2x2 single-layer layout (4 tiles, all in a row). */
const flatRow: TilePos[] = [
  { row: 0, col: 0, layer: 0 },
  { row: 0, col: 1, layer: 0 },
  { row: 0, col: 2, layer: 0 },
  { row: 0, col: 3, layer: 0 },
];

/** A layout with one tile sitting on top of another to test "covered" rule. */
const stackedLayout: TilePos[] = [
  { row: 0, col: 0, layer: 0 }, // bottom-left
  { row: 0, col: 0, layer: 1 }, // covers id 0
];

describe("mahjongEngine", () => {
  it("buildTiles produces deterministic tiles with the given seed and at least one matching pair", () => {
    const seed = 42;
    const tiles1 = buildTiles(flatRow, seed);
    const tiles2 = buildTiles(flatRow, seed);

    // Deterministic: same seed → identical face order.
    expect(tiles1.length).toBe(flatRow.length);
    expect(tiles1.map((t) => t.face)).toEqual(tiles2.map((t) => t.face));

    // Each tile carries its layout position and a sequential id, not removed/selected.
    tiles1.forEach((t, i) => {
      expect(t.id).toBe(i);
      expect(t.pos).toEqual(flatRow[i]);
      expect(t.removed).toBe(false);
      expect(t.selected).toBe(false);
      // Faces must come from the global TILE_FACES set (or padded star).
      expect(TILE_FACES.includes(t.face) || t.face === "★").toBe(true);
    });

    // 4 tiles is exactly one group of 4 identical faces → all four faces equal.
    const firstFace = tiles1[0]!.face;
    expect(tiles1.every((t) => t.face === firstFace)).toBe(true);
    // And therefore a matching pair must exist on the freshly built board.
    expect(hasMatchingPair(tiles1)).toBe(true);
  });

  it("isFree blocks tiles covered above and tiles flanked on both sides", () => {
    const tiles = buildTiles(stackedLayout, 7);
    // The top tile (id 1) is uncovered → free.
    expect(isFree(tiles[1]!, tiles)).toBe(true);
    // The bottom tile (id 0) is covered above → NOT free.
    expect(isFree(tiles[0]!, tiles)).toBe(false);

    // Now build a flat row of 3 tiles in a single layer: middle is flanked both sides.
    const rowLayout: TilePos[] = [
      { row: 0, col: 0, layer: 0 },
      { row: 0, col: 1, layer: 0 },
      { row: 0, col: 2, layer: 0 },
    ];
    const rowTiles = buildTiles(rowLayout, 1);
    expect(isFree(rowTiles[0]!, rowTiles)).toBe(true); // left edge
    expect(isFree(rowTiles[1]!, rowTiles)).toBe(false); // flanked
    expect(isFree(rowTiles[2]!, rowTiles)).toBe(true); // right edge

    // Removed tiles are never free.
    const removed = { ...rowTiles[0]!, removed: true };
    expect(isFree(removed, rowTiles)).toBe(false);
  });

  it("reducer matches two equal free tiles, marks them removed, and reports a win at completion", () => {
    const state = makeInitialState(flatRow, 99);
    // All four faces are identical (one group of 4), so any two free tiles match.

    // Initial state assertions.
    expect(state.removed).toBe(0);
    expect(state.total).toBe(4);
    expect(state.selectedId).toBeNull();
    expect(state.moves).toBe(0);
    expect(state.won).toBe(false);
    expect(state.gameOver).toBe(false);
    expect(isTerminal(state)).toBeNull();

    // Outer tiles (id 0, id 3) are free. Inner tiles (1, 2) are flanked.
    // Pick 0 then 3 → they match → both removed, moves=1, removed=2.
    const s1 = reducer(state, { type: "select", id: 0 });
    expect(s1.selectedId).toBe(0);
    expect(s1.tiles[0]!.selected).toBe(true);

    const s2 = reducer(s1, { type: "select", id: 3 });
    expect(s2.removed).toBe(2);
    expect(s2.moves).toBe(1);
    expect(s2.selectedId).toBeNull();
    expect(s2.tiles[0]!.removed).toBe(true);
    expect(s2.tiles[3]!.removed).toBe(true);
    expect(s2.won).toBe(false);

    // After removing 0 and 3, tiles 1 and 2 are no longer flanked and become free
    // (and still match). Hint helpers should surface one of them.
    const hintId = findHintTileId(s2);
    expect(hintId === 1 || hintId === 2).toBe(true);
    const hint = mahjongHint(s2);
    expect(hint).not.toBeNull();
    expect(hint!.selector).toContain(`hint-target-mahjong-tile-${hintId}`);
    expect(hint!.pulses).toBe(3);

    // Clear the remaining pair → win.
    const s3 = reducer(s2, { type: "select", id: 1 });
    const s4 = reducer(s3, { type: "select", id: 2 });
    expect(s4.removed).toBe(4);
    expect(s4.won).toBe(true);
    expect(s4.gameOver).toBe(false);
    expect(s4.moves).toBe(2);

    // After winning, reducer is a no-op and isTerminal reports a positive score.
    const noop = reducer(s4, { type: "select", id: 0 });
    expect(noop).toBe(s4);
    const terminal = isTerminal(s4);
    expect(terminal).not.toBeNull();
    // score = max(100, 10000 - moves*50) = max(100, 9900) = 9900.
    expect(terminal!.score).toBe(9900);

    // Once won, mahjongHint returns null (game already over for hint purposes).
    expect(mahjongHint(s4)).toBeNull();
  });
});
