import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isFree } from "./state.js";
import { PYRAMID_LAYOUT } from "../mahjong-solitaire-turtle/layouts.js";
import type { MahjongSolitaireState } from "./state.js";

describe("Mahjong Pyramid — initialState", () => {
  it("creates tiles matching Pyramid layout size", () => {
    const s = initialState(42);
    expect(s.tiles.length).toBe(PYRAMID_LAYOUT.length);
    expect(s.total).toBe(PYRAMID_LAYOUT.length);
  });

  it("each face appears exactly 4 times", () => {
    const s = initialState(42);
    const counts = new Map<string, number>();
    for (const t of s.tiles) counts.set(t.face, (counts.get(t.face) ?? 0) + 1);
    for (const [, count] of counts) expect(count).toBe(4);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(55);
    const s2 = initialState(55);
    expect(s1.tiles.map((t) => t.face)).toEqual(s2.tiles.map((t) => t.face));
  });

  it("different seeds give different tile arrangement", () => {
    const s1 = initialState(10);
    const s2 = initialState(20);
    expect(s1.tiles.map((t) => t.face)).not.toEqual(s2.tiles.map((t) => t.face));
  });
});

describe("Mahjong Pyramid — free tile logic", () => {
  it("at least one tile is free in initial state", () => {
    const s = initialState(42);
    const anyFree = s.tiles.some((t) => isFree(t, s.tiles));
    expect(anyFree).toBe(true);
  });

  it("removed tile is never free", () => {
    const s = initialState(42);
    const tiles = s.tiles.map((t, i) => (i === 0 ? { ...t, removed: true } : t));
    expect(isFree(tiles[0]!, tiles)).toBe(false);
  });
});

describe("Mahjong Pyramid — select reducer", () => {
  it("selecting a free tile sets selectedId", () => {
    const s = initialState(42);
    const freeTile = s.tiles.find((t) => isFree(t, s.tiles))!;
    const s2 = reducer(s, { type: "select", id: freeTile.id });
    expect(s2.selectedId).toBe(freeTile.id);
  });

  it("deselecting same tile clears selection", () => {
    const s = initialState(42);
    const freeTile = s.tiles.find((t) => isFree(t, s.tiles))!;
    let cur = reducer(s, { type: "select", id: freeTile.id });
    cur = reducer(cur, { type: "select", id: freeTile.id });
    expect(cur.selectedId).toBeNull();
  });

  it("matching free pair removes both", () => {
    const s = initialState(42);
    const freeTiles = s.tiles.filter((t) => isFree(t, s.tiles));
    let pairA = null as typeof freeTiles[0] | null;
    let pairB = null as typeof freeTiles[0] | null;
    for (let i = 0; i < freeTiles.length && !pairB; i++) {
      for (let j = i + 1; j < freeTiles.length && !pairB; j++) {
        if (freeTiles[i]!.face === freeTiles[j]!.face) {
          pairA = freeTiles[i]!;
          pairB = freeTiles[j]!;
        }
      }
    }
    if (!pairA || !pairB) return;
    let cur = reducer(s, { type: "select", id: pairA.id });
    cur = reducer(cur, { type: "select", id: pairB.id });
    expect(cur.removed).toBe(2);
  });

  it("mismatched second tile replaces selection", () => {
    const s = initialState(42);
    const freeTiles = s.tiles.filter((t) => isFree(t, s.tiles));
    let a = null as typeof freeTiles[0] | null;
    let b = null as typeof freeTiles[0] | null;
    for (let i = 0; i < freeTiles.length && !b; i++) {
      for (let j = i + 1; j < freeTiles.length && !b; j++) {
        if (freeTiles[i]!.face !== freeTiles[j]!.face) {
          a = freeTiles[i]!;
          b = freeTiles[j]!;
        }
      }
    }
    if (!a || !b) return;
    let cur = reducer(s, { type: "select", id: a.id });
    cur = reducer(cur, { type: "select", id: b.id });
    expect(cur.selectedId).toBe(b.id);
    expect(cur.removed).toBe(0);
  });
});

describe("Mahjong Pyramid — isTerminal", () => {
  it("returns null for active game", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score for won game", () => {
    const s: MahjongSolitaireState = { ...initialState(1), won: true, moves: 60 };
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("returns partial score for game over", () => {
    const s: MahjongSolitaireState = { ...initialState(1), gameOver: true, removed: 48, total: 144 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
    expect(result!.score).toBeLessThan(5000);
  });
});
