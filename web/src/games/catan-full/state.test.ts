import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  score,
  vpFor,
  publicVpFor,
  distanceRuleOk,
  isVertexOccupied,
  isEdgeOccupied,
  roadConnects,
  longestRoadLengthFor,
  allHexCoords,
  pipsFor,
  buildTopology,
  HEX_RADIUS,
} from "./state.js";
import type { CatanState, CatanAction, CatanSettings, PlayerState } from "./state.js";

const S: CatanSettings = { vpTarget: 10 };

describe("catan-full initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a.topology.hexes).toEqual(b.topology.hexes);
    expect(a.devDeck).toEqual(b.devDeck);
    expect(a.robberHex).toBe(b.robberHex);
    expect(a.players[0].resources).toEqual(b.players[0].resources);
  });

  it("different seeds usually yield different boards", () => {
    const a = initialState(1, S);
    const b = initialState(2, S);
    const sameTiles = a.topology.hexes.every((h, i) => h.type === b.topology.hexes[i]!.type);
    expect(sameTiles).toBe(false);
  });

  it("has 19 hex tiles in the canonical distribution", () => {
    const s = initialState(7, S);
    expect(s.topology.hexes.length).toBe(19);
    const counts: Record<string, number> = {};
    for (const h of s.topology.hexes) counts[h.type] = (counts[h.type] ?? 0) + 1;
    expect(counts.wood).toBe(4);
    expect(counts.brick).toBe(3);
    expect(counts.sheep).toBe(4);
    expect(counts.wheat).toBe(4);
    expect(counts.ore).toBe(3);
    expect(counts.desert).toBe(1);
  });

  it("robber starts on the desert hex", () => {
    const s = initialState(42, S);
    expect(s.topology.hexes[s.robberHex]!.type).toBe("desert");
  });

  it("has 54 vertices and 72 edges (standard Catan topology)", () => {
    const s = initialState(42, S);
    expect(s.topology.vertices.length).toBe(54);
    expect(s.topology.edges.length).toBe(72);
  });

  it("isTerminal is null at start", () => {
    const s = initialState(42, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("starts in setup phase with player 0 first", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("setup");
    expect(s.setupSubPhase).toBe("place_settlement");
    expect(s.current).toBe(0);
    expect(s.setupStep).toBe(0);
  });
});

describe("catan-full topology", () => {
  it("19 hex axial coords match radius-2 hex shape", () => {
    const coords = allHexCoords();
    expect(coords.length).toBe(19);
    for (const { q, r } of coords) {
      expect(Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))).toBeLessThanOrEqual(HEX_RADIUS);
    }
  });

  it("pips reflect standard probability", () => {
    expect(pipsFor(6)).toBe(5);
    expect(pipsFor(8)).toBe(5);
    expect(pipsFor(2)).toBe(1);
    expect(pipsFor(12)).toBe(1);
    expect(pipsFor(null)).toBe(0);
  });

  it("manual topology rebuild matches the boards's", () => {
    const s = initialState(99, S);
    const reb = buildTopology(s.topology.hexes);
    expect(reb.vertices.length).toBe(s.topology.vertices.length);
    expect(reb.edges.length).toBe(s.topology.edges.length);
  });
});

describe("catan-full setup phase", () => {
  it("placing a settlement at a legal vertex moves to road sub-phase", () => {
    let s = initialState(42, S);
    const legalVertex = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: legalVertex });
    expect(s.players[0].settlements).toContain(legalVertex);
    expect(s.setupSubPhase).toBe("place_road");
    expect(s.setupPendingSettlement).toBe(legalVertex);
  });

  it("rejects illegal settlement (occupied or too close)", () => {
    let s = initialState(42, S);
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    // Place a road so we advance.
    const eAdj = s.topology.edges.findIndex(e => e.a === v || e.b === v);
    s = reducer(s, { type: "setup_place_road", edge: eAdj });
    // Run CPU forward and back to player.
    s = runCpuUntilHuman(s);
    // Try to place on the human's own vertex (occupied).
    const before = s;
    const sNext = reducer(s, { type: "setup_place_settlement", vertex: v });
    expect(sNext).toBe(before); // unchanged reference
  });

  it("rejects road that doesn't touch the pending settlement", () => {
    let s = initialState(42, S);
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    // Find an edge that does NOT touch v.
    const e = s.topology.edges.findIndex(ed => ed.a !== v && ed.b !== v);
    const before = s;
    const sNext = reducer(s, { type: "setup_place_road", edge: e });
    expect(sNext).toBe(before);
  });

  it("after full setup, transitions to roll phase with player 0", () => {
    const s = runSetupToCompletion(initialState(42, S));
    expect(s.phase).toBe("roll");
    expect(s.current).toBe(0);
    expect(s.players[0].settlements.length).toBe(2);
    expect(s.players[0].roads.length).toBe(2);
    expect(s.players[1].settlements.length).toBe(2);
    expect(s.players[1].roads.length).toBe(2);
  });

  it("second settlement grants resources from adjacent hexes", () => {
    const s = runSetupToCompletion(initialState(42, S));
    // Total resources of player 0 should equal number of non-desert hexes adjacent to their 2nd settlement.
    const p0 = s.players[0];
    const total = p0.resources.wood + p0.resources.brick + p0.resources.sheep + p0.resources.wheat + p0.resources.ore;
    // At least 1 (some adjacent hex must be a resource).
    expect(total).toBeGreaterThanOrEqual(1);
    expect(total).toBeLessThanOrEqual(3);
  });
});

describe("catan-full reducer rejects illegal play", () => {
  it("reducer returns same ref when player has no resources to build", () => {
    const s = runSetupToCompletion(initialState(42, S));
    // Skip roll: cycle to play phase.
    let sp: CatanState = reducer(s, { type: "roll" });
    expect((sp.phase as string)).toBe("play");
    // Player likely doesn't have settlement resources after a single roll — try to build road on an unrelated edge.
    const farEdge = findUnconnectedEdge(sp, 0);
    if (farEdge >= 0) {
      const before = sp;
      const sNext = reducer(sp, { type: "build_road", edge: farEdge });
      expect(sNext).toBe(before);
    }
  });

  it("end_turn from human transitions to CPU phase", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase === "play") {
      s = reducer(s, { type: "end_turn" });
      expect(s.phase).toBe("cpu");
      expect(s.current).toBe(1);
    }
  });
});

describe("catan-full bank trade", () => {
  it("trades 4-of-a-kind for 1 of another resource", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase !== "play") return;
    // Manually seed resources for the test.
    const players = s.players.map(p => ({ ...p, resources: { ...p.resources } })) as [PlayerState, PlayerState];
    players[0].resources = { wood: 4, brick: 0, sheep: 0, wheat: 0, ore: 0 };
    const sp = { ...s, players };
    const after = reducer(sp, { type: "trade_bank", give: "wood", receive: "brick" });
    expect(after.players[0].resources.wood).toBe(0);
    expect(after.players[0].resources.brick).toBe(1);
  });

  it("rejects trade with < 4 of give resource", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase !== "play") return;
    const players = s.players.map(p => ({ ...p, resources: { ...p.resources } })) as [PlayerState, PlayerState];
    players[0].resources = { wood: 3, brick: 0, sheep: 0, wheat: 0, ore: 0 };
    const sp = { ...s, players };
    const after = reducer(sp, { type: "trade_bank", give: "wood", receive: "brick" });
    expect(after).toBe(sp);
  });
});

describe("catan-full victory & terminal", () => {
  it("isTerminal returns score when winner is set", () => {
    let s = runSetupToCompletion(initialState(42, S));
    // Force a winner via state manipulation.
    s = { ...s, phase: "done", winner: 0, message: "Victory!" };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("score is 0 for CPU win", () => {
    let s = initialState(42, S);
    s = { ...s, phase: "done", winner: 1 };
    expect(score(s)).toBe(0);
  });

  it("vpFor counts settlements (1), cities (2), longest road (2), largest army (2), and hidden VP cards", () => {
    let s = initialState(42, S);
    const players = s.players.map(p => ({ ...p })) as [PlayerState, PlayerState];
    players[0].settlements = [0, 1];           // +2
    players[0].cities = [2];                   // +2
    players[0].vpHidden = 1;                   // +1
    const sp = { ...s, players, longestRoad: 0 as const, largestArmy: 0 as const }; // +2 +2
    expect(vpFor(sp, 0)).toBe(9);
    expect(publicVpFor(sp, 0)).toBe(8); // hidden VP excluded
  });

  it("longest road length is 0 with no roads, and counts simple paths", () => {
    let s = initialState(42, S);
    expect(longestRoadLengthFor(s, 0)).toBe(0);
    // Add 3 connected roads.
    // Find 3 edges that share endpoints forming a path.
    const e0 = s.topology.edges[0]!;
    const v = e0.b;
    const e1Idx = s.topology.edges.findIndex((e, i) => i !== 0 && (e.a === v || e.b === v));
    expect(e1Idx).toBeGreaterThan(0);
    const e1 = s.topology.edges[e1Idx]!;
    const v2 = e1.a === v ? e1.b : e1.a;
    const e2Idx = s.topology.edges.findIndex((e, i) =>
      i !== 0 && i !== e1Idx && (e.a === v2 || e.b === v2));
    if (e2Idx >= 0) {
      const players = s.players.map(p => ({ ...p, roads: p.roads.slice() })) as [PlayerState, PlayerState];
      players[0].roads = [0, e1Idx, e2Idx];
      const sp = { ...s, players };
      expect(longestRoadLengthFor(sp, 0)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("catan-full distance rule", () => {
  it("distance rule blocks adjacent vertices", () => {
    let s = initialState(42, S);
    // Place at vertex 0 manually.
    const players = s.players.map(p => ({ ...p, settlements: p.settlements.slice() })) as [PlayerState, PlayerState];
    players[0].settlements = [0];
    const sp = { ...s, players };
    expect(distanceRuleOk(sp, 0)).toBe(false); // occupied
    const neighbors = sp.topology.vertices[0]!.adjVerts;
    for (const nb of neighbors) {
      expect(distanceRuleOk(sp, nb)).toBe(false);
    }
  });

  it("isEdgeOccupied true after road placement", () => {
    let s = initialState(42, S);
    const players = s.players.map(p => ({ ...p, roads: p.roads.slice() })) as [PlayerState, PlayerState];
    players[0].roads = [0];
    const sp = { ...s, players };
    expect(isEdgeOccupied(sp, 0)).toBe(true);
    expect(isEdgeOccupied(sp, 1)).toBe(false);
  });

  it("roadConnects returns true for edge adjacent to player's settlement", () => {
    let s = initialState(42, S);
    const players = s.players.map(p => ({ ...p, settlements: p.settlements.slice() })) as [PlayerState, PlayerState];
    const e = s.topology.edges[0]!;
    players[0].settlements = [e.a];
    const sp = { ...s, players };
    expect(roadConnects(sp, 0, 0)).toBe(true);
    // An unrelated edge with no settlement at either endpoint and no roads:
    const farEdge = sp.topology.edges.findIndex(ed => ed.a !== e.a && ed.b !== e.a && ed.a !== e.b && ed.b !== e.b);
    if (farEdge >= 0) expect(roadConnects(sp, 0, farEdge)).toBe(false);
  });
});

describe("catan-full play actions (resource-seeded)", () => {
  it("build_road succeeds with wood+brick and a connected edge", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase !== "play") return;
    const p0 = s.players[0];
    const settleVert = p0.settlements[0]!;
    // Find an unoccupied edge touching that vertex.
    const targetEdge = s.topology.edges.findIndex((e, i) =>
      (e.a === settleVert || e.b === settleVert) && !isEdgeOccupied(s, i));
    if (targetEdge < 0) return;
    const players = s.players.map(p => ({ ...p, resources: { ...p.resources }, roads: p.roads.slice() })) as [PlayerState, PlayerState];
    players[0].resources = { wood: 1, brick: 1, sheep: 0, wheat: 0, ore: 0 };
    const sp = { ...s, players };
    const after = reducer(sp, { type: "build_road", edge: targetEdge });
    expect(after.players[0].roads).toContain(targetEdge);
    expect(after.players[0].resources.wood).toBe(0);
    expect(after.players[0].resources.brick).toBe(0);
  });

  it("build_settlement requires connection to player's road network", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase !== "play") return;
    const players = s.players.map(p => ({ ...p, resources: { ...p.resources } })) as [PlayerState, PlayerState];
    players[0].resources = { wood: 1, brick: 1, sheep: 1, wheat: 1, ore: 0 };
    const sp = { ...s, players };
    // Pick a vertex that's NOT on the road network and is legal by distance.
    let unconnected = -1;
    for (let vi = 0; vi < sp.topology.vertices.length; vi++) {
      if (!distanceRuleOk(sp, vi)) continue;
      let onNetwork = false;
      for (const ei of sp.players[0].roads) {
        const e = sp.topology.edges[ei]!;
        if (e.a === vi || e.b === vi) { onNetwork = true; break; }
      }
      if (!onNetwork) { unconnected = vi; break; }
    }
    if (unconnected >= 0) {
      const after = reducer(sp, { type: "build_settlement", vertex: unconnected });
      expect(after).toBe(sp); // rejected
    }
  });

  it("CPU step advances setup placement when invoked in cpu phase", () => {
    let s = initialState(42, S);
    // Player 0 places first settlement + road.
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    const eAdj = s.topology.edges.findIndex(e => e.a === v || e.b === v);
    s = reducer(s, { type: "setup_place_road", edge: eAdj });
    // CPU's turn now.
    expect(s.phase).toBe("cpu");
    s = reducer(s, { type: "cpu_step" });
    expect(s.players[1].settlements.length).toBe(1);
    s = reducer(s, { type: "cpu_step" });
    expect(s.players[1].roads.length).toBe(1);
  });
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function findLegalVertex(s: CatanState): number {
  for (let vi = 0; vi < s.topology.vertices.length; vi++) {
    if (distanceRuleOk(s, vi)) return vi;
  }
  return 0;
}

function findUnconnectedEdge(s: CatanState, pid: 0 | 1): number {
  for (let ei = 0; ei < s.topology.edges.length; ei++) {
    if (isEdgeOccupied(s, ei)) continue;
    if (!roadConnects(s, pid, ei)) return ei;
  }
  return -1;
}

function runCpuUntilHuman(s: CatanState): CatanState {
  let cur = s;
  // Step the CPU forward until we get back to the human (or done).
  let guard = 0;
  while (cur.phase === "cpu" && guard++ < 20) {
    cur = reducer(cur, { type: "cpu_step" });
  }
  return cur;
}

function runSetupToCompletion(s0: CatanState): CatanState {
  let s = s0;
  // P0 settlement
  const v0 = findLegalVertex(s);
  s = reducer(s, { type: "setup_place_settlement", vertex: v0 });
  const e0 = s.topology.edges.findIndex(e => e.a === v0 || e.b === v0);
  s = reducer(s, { type: "setup_place_road", edge: e0 });
  // P1 turns (CPU): cpu_step x2 each for settlement & road, ×2 turns.
  s = runCpuUntilHuman(s);
  // P0 second settlement
  if (s.phase === "setup" && s.current === 0) {
    const v1 = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v1 });
    const e1 = s.topology.edges.findIndex(e => e.a === v1 || e.b === v1);
    if (e1 >= 0) {
      s = reducer(s, { type: "setup_place_road", edge: e1 });
    }
  }
  // P1 (if any remaining CPU steps)
  s = runCpuUntilHuman(s);
  return s;
}
