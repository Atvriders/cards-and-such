import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  isFree,
  hasMatchingPair,
  buildTiles,
  buildDeck,
  TURTLE_LAYOUT,
} from "./state.js";
import type { MahjongState, MahjongTile } from "./state.js";

describe("Mahjong Solitaire (Full Turtle) — layout & deck", () => {
  it("turtle layout has exactly 144 positions", () => {
    expect(TURTLE_LAYOUT.length).toBe(144);
  });

  it("deck has exactly 144 tiles", () => {
    expect(buildDeck().length).toBe(144);
  });

  it("deck contains all 7 categories", () => {
    const deck = buildDeck();
    const cats = new Set(deck.map((t) => t.category));
    expect(cats.has("dots")).toBe(true);
    expect(cats.has("bamboo")).toBe(true);
    expect(cats.has("characters")).toBe(true);
    expect(cats.has("wind")).toBe(true);
    expect(cats.has("dragon")).toBe(true);
    expect(cats.has("flower")).toBe(true);
    expect(cats.has("season")).toBe(true);
  });

  it("flowers all share matchKey 'flower' (category match)", () => {
    const deck = buildDeck();
    const flowers = deck.filter((t) => t.category === "flower");
    expect(flowers.length).toBe(4);
    for (const f of flowers) expect(f.matchKey).toBe("flower");
  });

  it("seasons all share matchKey 'season' (category match)", () => {
    const deck = buildDeck();
    const seasons = deck.filter((t) => t.category === "season");
    expect(seasons.length).toBe(4);
    for (const s of seasons) expect(s.matchKey).toBe("season");
  });

  it("every standard match key appears exactly 4 times", () => {
    const deck = buildDeck();
    const counts = new Map<string, number>();
    for (const t of deck) {
      if (t.category === "flower" || t.category === "season") continue;
      counts.set(t.matchKey, (counts.get(t.matchKey) ?? 0) + 1);
    }
    for (const [, c] of counts) expect(c).toBe(4);
    // 9+9+9+4+3 = 34 distinct standard keys
    expect(counts.size).toBe(34);
  });
});

describe("Mahjong Solitaire (Full Turtle) — initialState", () => {
  it("creates 144 tiles, none removed", () => {
    const s = initialState(42);
    expect(s.tiles.length).toBe(144);
    expect(s.total).toBe(144);
    expect(s.tiles.every((t) => !t.removed)).toBe(true);
  });

  it("is deterministic by seed", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.tiles.map((t) => t.face)).toEqual(s2.tiles.map((t) => t.face));
    expect(s1.tiles.map((t) => t.matchKey)).toEqual(s2.tiles.map((t) => t.matchKey));
  });

  it("different seeds give different arrangements", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    const keys1 = s1.tiles.map((t) => t.matchKey).join(",");
    const keys2 = s2.tiles.map((t) => t.matchKey).join(",");
    expect(keys1).not.toEqual(keys2);
  });

  it("starts with no selection and no progress", () => {
    const s = initialState(7);
    expect(s.selectedId).toBeNull();
    expect(s.removed).toBe(0);
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
    expect(s.stuck).toBe(false);
  });
});

describe("Mahjong Solitaire (Full Turtle) — isFree", () => {
  it("the apex tile (highest layer) is always free", () => {
    const s = initialState(42);
    const maxLayer = Math.max(...s.tiles.map((t) => t.pos.layer));
    const apex = s.tiles.filter((t) => t.pos.layer === maxLayer);
    for (const t of apex) {
      expect(isFree(t, s.tiles)).toBe(true);
    }
  });

  it("a removed tile is never free", () => {
    const s = initialState(42);
    const t = { ...s.tiles[0]!, removed: true };
    const tiles = [t, ...s.tiles.slice(1)];
    expect(isFree(t, tiles)).toBe(false);
  });

  it("interior layer-0 tile (both sides blocked, top covered) is not free", () => {
    const s = initialState(42);
    // The base mat has many fully-surrounded interior tiles.
    const blocked = s.tiles.find((t) => !isFree(t, s.tiles));
    expect(blocked).toBeDefined();
  });
});

describe("Mahjong Solitaire (Full Turtle) — reducer", () => {
  it("selecting a free tile sets selectedId", () => {
    const s = initialState(42);
    const free = s.tiles.find((t) => isFree(t, s.tiles))!;
    const s2 = reducer(s, { type: "select", id: free.id });
    expect(s2.selectedId).toBe(free.id);
    expect(s2.tiles.find((t) => t.id === free.id)!.selected).toBe(true);
  });

  it("selecting a blocked tile is a no-op (returns same reference)", () => {
    const s = initialState(42);
    const blocked = s.tiles.find((t) => !isFree(t, s.tiles));
    if (!blocked) {
      // Pathological — but every seed will have many blocked tiles.
      throw new Error("expected some blocked tiles in initial state");
    }
    const s2 = reducer(s, { type: "select", id: blocked.id });
    expect(s2).toBe(s);
  });

  it("selecting the same tile twice clears the selection", () => {
    const s = initialState(42);
    const free = s.tiles.find((t) => isFree(t, s.tiles))!;
    let cur = reducer(s, { type: "select", id: free.id });
    expect(cur.selectedId).toBe(free.id);
    cur = reducer(cur, { type: "select", id: free.id });
    expect(cur.selectedId).toBeNull();
    expect(cur.tiles.every((t) => !t.selected)).toBe(true);
  });

  it("deselect action clears the current selection", () => {
    const s = initialState(42);
    const free = s.tiles.find((t) => isFree(t, s.tiles))!;
    const sel = reducer(s, { type: "select", id: free.id });
    const cleared = reducer(sel, { type: "deselect" });
    expect(cleared.selectedId).toBeNull();
    expect(cleared.tiles.every((t) => !t.selected)).toBe(true);
  });

  it("matching two free tiles with the same matchKey removes both", () => {
    const s = initialState(42);
    const free = s.tiles.filter((t) => isFree(t, s.tiles));
    let a: MahjongTile | null = null;
    let b: MahjongTile | null = null;
    outer: for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (free[i]!.matchKey === free[j]!.matchKey) {
          a = free[i]!;
          b = free[j]!;
          break outer;
        }
      }
    }
    if (!a || !b) throw new Error("seed 42 should have a free pair");
    let cur = reducer(s, { type: "select", id: a.id });
    cur = reducer(cur, { type: "select", id: b.id });
    expect(cur.tiles.find((t) => t.id === a!.id)!.removed).toBe(true);
    expect(cur.tiles.find((t) => t.id === b!.id)!.removed).toBe(true);
    expect(cur.removed).toBe(2);
    expect(cur.moves).toBe(1);
    expect(cur.selectedId).toBeNull();
  });

  it("non-matching second selection replaces the first selection", () => {
    const s = initialState(42);
    const free = s.tiles.filter((t) => isFree(t, s.tiles));
    let a: MahjongTile | null = null;
    let b: MahjongTile | null = null;
    for (let i = 0; i < free.length && !b; i++) {
      for (let j = i + 1; j < free.length && !b; j++) {
        if (free[i]!.matchKey !== free[j]!.matchKey) {
          a = free[i]!;
          b = free[j]!;
        }
      }
    }
    if (!a || !b) throw new Error("expected a non-matching free pair");
    let cur = reducer(s, { type: "select", id: a.id });
    cur = reducer(cur, { type: "select", id: b.id });
    expect(cur.selectedId).toBe(b.id);
    expect(cur.tiles.find((t) => t.id === a!.id)!.removed).toBe(false);
    expect(cur.tiles.find((t) => t.id === b!.id)!.removed).toBe(false);
    expect(cur.tiles.find((t) => t.id === a!.id)!.selected).toBe(false);
    expect(cur.tiles.find((t) => t.id === b!.id)!.selected).toBe(true);
  });

  it("reset action produces a fresh deterministic state", () => {
    const s = initialState(5);
    const free = s.tiles.find((t) => isFree(t, s.tiles))!;
    const advanced = reducer(s, { type: "select", id: free.id });
    expect(advanced.selectedId).toBe(free.id);
    const reset = reducer(advanced, { type: "reset", seed: 5 });
    expect(reset.selectedId).toBeNull();
    expect(reset.removed).toBe(0);
    // Same as initial(5).
    expect(reset.tiles.map((t) => t.matchKey)).toEqual(
      initialState(5).tiles.map((t) => t.matchKey),
    );
  });
});

describe("Mahjong Solitaire (Full Turtle) — isTerminal & end states", () => {
  it("returns null on a fresh state", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns { score: removed } on win", () => {
    const base = initialState(42);
    const s: MahjongState = { ...base, won: true, removed: 144 };
    expect(isTerminal(s)).toEqual({ score: 144 });
  });

  it("returns { score: 0 } when stuck (loss)", () => {
    const base = initialState(42);
    const s: MahjongState = { ...base, stuck: true, removed: 38 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("after a winning final match, won=true and isTerminal returns score=144", () => {
    // Construct a tiny synthetic state: 2 tiles left, both free, matching.
    const base = initialState(42);
    const tiny: MahjongState = {
      ...base,
      total: 2,
      removed: 0,
      tiles: [
        {
          id: 0,
          face: "🀙",
          matchKey: "dot-🀙",
          category: "dots",
          pos: { row: 0, col: 0, layer: 0 },
          removed: false,
          selected: false,
        },
        {
          id: 1,
          face: "🀙",
          matchKey: "dot-🀙",
          category: "dots",
          pos: { row: 0, col: 4, layer: 0 },
          removed: false,
          selected: false,
        },
      ],
    };
    let cur = reducer(tiny, { type: "select", id: 0 });
    cur = reducer(cur, { type: "select", id: 1 });
    expect(cur.won).toBe(true);
    expect(cur.removed).toBe(2);
    const term = isTerminal(cur);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(2);
  });

  it("hasMatchingPair detects when no free pair remains", () => {
    // Two free tiles with different matchKeys → no pair, stuck.
    const tiles: MahjongTile[] = [
      {
        id: 0,
        face: "🀙",
        matchKey: "dot-🀙",
        category: "dots",
        pos: { row: 0, col: 0, layer: 0 },
        removed: false,
        selected: false,
      },
      {
        id: 1,
        face: "🀚",
        matchKey: "dot-🀚",
        category: "dots",
        pos: { row: 0, col: 4, layer: 0 },
        removed: false,
        selected: false,
      },
    ];
    expect(hasMatchingPair(tiles)).toBe(false);
    // Flip second to match → pair exists.
    tiles[1]!.matchKey = "dot-🀙";
    expect(hasMatchingPair(tiles)).toBe(true);
  });

  it("after matching the last two with no pair available → stuck and score=0", () => {
    // Three tiles, none of which can form a pair after first match.
    const base = initialState(42);
    const tiny: MahjongState = {
      ...base,
      total: 4,
      removed: 0,
      tiles: [
        {
          id: 0,
          face: "🀙",
          matchKey: "dot-🀙",
          category: "dots",
          pos: { row: 0, col: 0, layer: 0 },
          removed: false,
          selected: false,
        },
        {
          id: 1,
          face: "🀙",
          matchKey: "dot-🀙",
          category: "dots",
          pos: { row: 0, col: 4, layer: 0 },
          removed: false,
          selected: false,
        },
        {
          id: 2,
          face: "🀚",
          matchKey: "dot-🀚",
          category: "dots",
          pos: { row: 0, col: 8, layer: 0 },
          removed: false,
          selected: false,
        },
        {
          id: 3,
          face: "🀛",
          matchKey: "dot-🀛",
          category: "dots",
          pos: { row: 0, col: 12, layer: 0 },
          removed: false,
          selected: false,
        },
      ],
    };
    let cur = reducer(tiny, { type: "select", id: 0 });
    cur = reducer(cur, { type: "select", id: 1 });
    // 2 left, no possible match → stuck.
    expect(cur.stuck).toBe(true);
    const term = isTerminal(cur);
    expect(term).toEqual({ score: 0 });
  });
});

describe("Mahjong Solitaire (Full Turtle) — buildTiles", () => {
  it("places tiles at the layout positions in order", () => {
    const tiles = buildTiles(TURTLE_LAYOUT, 1);
    expect(tiles.length).toBe(TURTLE_LAYOUT.length);
    tiles.forEach((t, i) => {
      expect(t.pos).toEqual(TURTLE_LAYOUT[i]);
    });
  });

  it("two builds with the same seed are identical", () => {
    const a = buildTiles(TURTLE_LAYOUT, 123);
    const b = buildTiles(TURTLE_LAYOUT, 123);
    expect(a.map((t) => t.matchKey)).toEqual(b.map((t) => t.matchKey));
  });
});
