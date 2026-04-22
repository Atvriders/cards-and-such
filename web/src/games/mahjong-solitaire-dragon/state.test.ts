import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isFree } from "./state.js";
import { DRAGON_LAYOUT } from "../mahjong-solitaire-turtle/layouts.js";
import type { MahjongSolitaireState } from "./state.js";

describe("Mahjong Dragon — initialState", () => {
  it("creates correct number of tiles matching Dragon layout", () => {
    const s = initialState(42);
    expect(s.tiles.length).toBe(DRAGON_LAYOUT.length);
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
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    expect(s1.tiles.map((t) => t.face)).toEqual(s2.tiles.map((t) => t.face));
  });

  it("produces different arrangement with different seed", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    expect(s1.tiles.map((t) => t.face)).not.toEqual(s2.tiles.map((t) => t.face));
  });
});

describe("Mahjong Dragon — gameplay", () => {
  it("selecting a free tile sets selectedId", () => {
    const s = initialState(42);
    const freeTile = s.tiles.find((t) => isFree(t, s.tiles))!;
    const s2 = reducer(s, { type: "select", id: freeTile.id });
    expect(s2.selectedId).toBe(freeTile.id);
  });

  it("selecting blocked tile is a no-op", () => {
    const s = initialState(42);
    const blocked = s.tiles.find((t) => !isFree(t, s.tiles));
    if (!blocked) return;
    const s2 = reducer(s, { type: "select", id: blocked.id });
    expect(s2.selectedId).toBeNull();
  });

  it("matching pair removes both tiles", () => {
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
    expect(cur.tiles.find((t) => t.id === pairA!.id)!.removed).toBe(true);
  });

  it("non-matching tiles swap selection", () => {
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

  it("isTerminal returns null for ongoing game", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("isTerminal returns score for won game", () => {
    const s: MahjongSolitaireState = { ...initialState(1), won: true, moves: 50 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
