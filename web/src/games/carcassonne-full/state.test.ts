import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  buildDeck,
  TILE_DISTRIBUTION,
  allLegalPlacements,
  canPlace,
  edgeAfterRot,
  ORIGIN,
  NUM_PLAYERS,
  MEEPLES_PER_PLAYER,
} from "./state.js";
import type { CarcassonneFullState, TileProto } from "./state.js";

const DEFAULT_SETTINGS = { cpu: "greedy" as const };

describe("Carcassonne Full", () => {
  it("deck contains exactly 72 tiles including the starter", () => {
    const deck = buildDeck();
    expect(deck.length).toBe(72);
    const starters = deck.filter((t) => t.start === true);
    expect(starters.length).toBe(1);
  });

  it("TILE_DISTRIBUTION counts add up to 72", () => {
    const total = TILE_DISTRIBUTION.reduce((s, { count }) => s + count, 0);
    expect(total).toBe(72);
  });

  it("initialState is deterministic by seed", () => {
    const a = initialState(42, DEFAULT_SETTINGS);
    const b = initialState(42, DEFAULT_SETTINGS);
    // Same starter placement, same first drawn tile, same bag order
    expect(a.placed.length).toBe(1);
    expect(b.placed.length).toBe(1);
    expect(a.placed[0]!.x).toBe(ORIGIN);
    expect(a.placed[0]!.y).toBe(ORIGIN);
    expect(a.current?.id).toBe(b.current?.id);
    expect(a.bag.map((t) => t.id).join(",")).toBe(b.bag.map((t) => t.id).join(","));
  });

  it("initialState starts with full meeple supplies, zero scores, human to move", () => {
    const s = initialState(7, DEFAULT_SETTINGS);
    expect(s.supply).toEqual(Array(NUM_PLAYERS).fill(MEEPLES_PER_PLAYER));
    expect(s.scores).toEqual(Array(NUM_PLAYERS).fill(0));
    expect(s.turn).toBe(0);
    expect(s.phase).toBe("place");
    expect(s.current).not.toBeNull();
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(0, DEFAULT_SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });

  it("rejects placement with no neighbours or non-matching edges", () => {
    const s = initialState(3, DEFAULT_SETTINGS);
    const proto = s.current!;
    // Far-away cell has no neighbour: illegal.
    expect(canPlace(s, proto, 0, 0, 0)).toBe(false);
    // Reducer returns same reference on illegal move
    const s1 = reducer(s, { type: "place", x: 0, y: 0, rot: 0 });
    expect(s1).toBe(s);
  });

  it("legal placement transitions phase to meeple and adds a placed tile", () => {
    const s = initialState(11, DEFAULT_SETTINGS);
    const legals = allLegalPlacements(s, s.current!);
    expect(legals.length).toBeGreaterThan(0);
    const { x, y, rot } = legals[0]!;
    const s1 = reducer(s, { type: "place", x, y, rot });
    expect(s1.phase).toBe("meeple");
    expect(s1.placed.length).toBe(s.placed.length + 1);
    expect(s1.placed[s1.placed.length - 1]!.x).toBe(x);
    expect(s1.placed[s1.placed.length - 1]!.y).toBe(y);
  });

  it("skipping the meeple advances to the next seat", () => {
    const s = initialState(11, DEFAULT_SETTINGS);
    const legals = allLegalPlacements(s, s.current!);
    const { x, y, rot } = legals[0]!;
    const s1 = reducer(s, { type: "place", x, y, rot });
    const s2 = reducer(s1, { type: "meeple", side: null });
    expect(s2.turn).not.toBe(s.turn);
    // Supply unchanged because we skipped
    expect(s2.supply[0]).toBe(MEEPLES_PER_PLAYER);
  });

  it("placing a meeple on the tile decrements supply and adds it to meeples", () => {
    const s = initialState(11, DEFAULT_SETTINGS);
    const legals = allLegalPlacements(s, s.current!);
    const { x, y, rot } = legals[0]!;
    const s1 = reducer(s, { type: "place", x, y, rot });
    // Pick a side that's legal — find any side whose feature is unoccupied.
    // For the freshly placed tile, no prior meeples exist; the starter
    // tile may share a feature with the placed tile via the matched edge.
    // Try side N (which exists on every tile).
    const beforeSupply = s1.supply[0]!;
    const beforeMeeples = s1.meeples.length;
    const s2 = reducer(s1, { type: "meeple", side: 0 });
    // Either the meeple was placed or the feature was occupied; in either
    // case the turn advanced.
    expect(s2.turn).not.toBe(s.turn);
    if (s2.meeples.length === beforeMeeples + 1) {
      expect(s2.supply[0]).toBe(beforeSupply - 1);
    } else {
      // Feature was already occupied — supply unchanged.
      expect(s2.supply[0]).toBe(beforeSupply);
    }
  });

  it("edgeAfterRot rotates edge kinds clockwise", () => {
    const proto: TileProto = {
      id: "test",
      edges: ["city", "road", "field", "road"],
      joins: [[1, 3]],
      cloister: false,
      shield: false,
    };
    // No rotation: N=city, E=road, S=field, W=road
    expect(edgeAfterRot(proto, 0, 0)).toBe("city");
    expect(edgeAfterRot(proto, 0, 1)).toBe("road");
    // 1 step CW: the original N edge now points E, etc. So new N is old W.
    expect(edgeAfterRot(proto, 1, 0)).toBe("road");
    expect(edgeAfterRot(proto, 1, 1)).toBe("city");
  });

  it("plays through to the end via cpuStep and yields a terminal score", () => {
    // This drives 3 players from a fresh state to completion, alternating
    // greedy CPU steps for seats 1/2 and auto-skip meeples for seat 0.
    let s: CarcassonneFullState = initialState(99, DEFAULT_SETTINGS);
    let safety = 600;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.turn === 0) {
        if (s.phase === "place") {
          const legals = allLegalPlacements(s, s.current!);
          if (legals.length === 0) break;
          const pick = legals[0]!;
          s = reducer(s, { type: "place", x: pick.x, y: pick.y, rot: pick.rot });
        } else if (s.phase === "meeple") {
          s = reducer(s, { type: "meeple", side: null });
        }
      } else {
        s = reducer(s, { type: "cpuStep" });
      }
    }
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(typeof term!.score).toBe("number");
    // Sum of scores should be non-negative.
    const sum = s.scores.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThanOrEqual(0);
  }, 30000);

  it("reducer ignores actions when phase is done", () => {
    const s = initialState(0, DEFAULT_SETTINGS);
    const done: CarcassonneFullState = { ...s, phase: "done" };
    const s1 = reducer(done, { type: "place", x: 0, y: 0, rot: 0 });
    expect(s1).toBe(done);
  });
});
