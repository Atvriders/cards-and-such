import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isFree, buildTiles, TILE_FACES } from "./state.js";
import { TURTLE_LAYOUT } from "./layouts.js";
import type { MahjongSolitaireState } from "./state.js";

describe("Mahjong Turtle — initialState", () => {
  it("creates 144 tiles, none removed", () => {
    const s = initialState(42);
    expect(s.tiles.length).toBe(144);
    expect(s.tiles.every((t) => !t.removed)).toBe(true);
  });

  it("each face appears exactly 4 times", () => {
    const s = initialState(42);
    const counts = new Map<string, number>();
    for (const t of s.tiles) {
      counts.set(t.face, (counts.get(t.face) ?? 0) + 1);
    }
    for (const [, count] of counts) {
      expect(count).toBe(4);
    }
    expect(counts.size).toBe(36);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.tiles.map((t) => t.face)).toEqual(s2.tiles.map((t) => t.face));
  });

  it("different seeds give different layouts", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    expect(s1.tiles.map((t) => t.face)).not.toEqual(s2.tiles.map((t) => t.face));
  });

  it("starts with no selection and no removal", () => {
    const s = initialState(7);
    expect(s.selectedId).toBeNull();
    expect(s.removed).toBe(0);
    expect(s.won).toBe(false);
    expect(s.gameOver).toBe(false);
  });
});

describe("Mahjong Turtle — isFree", () => {
  it("top-layer tile with no neighbours is free", () => {
    const s = initialState(42);
    // Find the topmost-layer tile
    const maxLayer = Math.max(...s.tiles.map((t) => t.pos.layer));
    const topTiles = s.tiles.filter((t) => t.pos.layer === maxLayer);
    // At least some top tiles should be free
    const anyFree = topTiles.some((t) => isFree(t, s.tiles));
    expect(anyFree).toBe(true);
  });

  it("removed tile is not free", () => {
    const s = initialState(42);
    const tile = { ...s.tiles[0]!, removed: true };
    const tiles = [tile, ...s.tiles.slice(1)];
    expect(isFree(tile, tiles)).toBe(false);
  });
});

describe("Mahjong Turtle — select action", () => {
  it("selecting a free tile sets selectedId", () => {
    const s = initialState(42);
    const freeTile = s.tiles.find((t) => isFree(t, s.tiles))!;
    const s2 = reducer(s, { type: "select", id: freeTile.id });
    expect(s2.selectedId).toBe(freeTile.id);
    expect(s2.tiles.find((t) => t.id === freeTile.id)!.selected).toBe(true);
  });

  it("selecting a blocked tile is a no-op", () => {
    const s = initialState(42);
    const blockedTile = s.tiles.find((t) => !isFree(t, s.tiles));
    if (!blockedTile) return; // skip if all free somehow
    const s2 = reducer(s, { type: "select", id: blockedTile.id });
    expect(s2.selectedId).toBeNull();
  });

  it("matching two identical free tiles removes them", () => {
    const s = initialState(42);
    // Build a pair of adjacent free tiles with same face
    const freeTiles = s.tiles.filter((t) => isFree(t, s.tiles));
    let pairA: (typeof freeTiles)[0] | null = null;
    let pairB: (typeof freeTiles)[0] | null = null;
    for (let i = 0; i < freeTiles.length && !pairB; i++) {
      for (let j = i + 1; j < freeTiles.length && !pairB; j++) {
        if (freeTiles[i]!.face === freeTiles[j]!.face) {
          pairA = freeTiles[i]!;
          pairB = freeTiles[j]!;
        }
      }
    }
    if (!pairA || !pairB) return; // no matching pair found in this seed (unlikely)
    let cur = reducer(s, { type: "select", id: pairA.id });
    cur = reducer(cur, { type: "select", id: pairB.id });
    expect(cur.tiles.find((t) => t.id === pairA!.id)!.removed).toBe(true);
    expect(cur.tiles.find((t) => t.id === pairB!.id)!.removed).toBe(true);
    expect(cur.removed).toBe(2);
    expect(cur.selectedId).toBeNull();
  });

  it("selecting same tile twice deselects it", () => {
    const s = initialState(42);
    const freeTile = s.tiles.find((t) => isFree(t, s.tiles))!;
    let cur = reducer(s, { type: "select", id: freeTile.id });
    expect(cur.selectedId).toBe(freeTile.id);
    cur = reducer(cur, { type: "select", id: freeTile.id });
    expect(cur.selectedId).toBeNull();
  });
});

describe("Mahjong Turtle — isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when won", () => {
    const s: MahjongSolitaireState = { ...initialState(42), won: true, moves: 72 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 10000 - 72 * 50));
  });

  it("returns partial score on game over", () => {
    const s: MahjongSolitaireState = { ...initialState(42), gameOver: true, removed: 72, total: 144 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(2500);
  });

  it("TILE_FACES has exactly 36 entries", () => {
    expect(TILE_FACES.length).toBe(36);
  });
});

describe("Mahjong Turtle — buildTiles", () => {
  it("assigns positions from layout", () => {
    const tiles = buildTiles(TURTLE_LAYOUT, 1);
    expect(tiles.length).toBe(TURTLE_LAYOUT.length);
    tiles.forEach((t, i) => {
      expect(t.pos).toEqual(TURTLE_LAYOUT[i]);
    });
  });
});
