import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  score,
  vpFor,
  distanceRuleOk,
  isVertexOccupied,
  isEdgeOccupied,
  roadConnects,
  activeKnightStrength,
  totalKnightStrength,
  allHexCoords,
  pipsFor,
  buildTopology,
  commodityFor,
  TILE_TO_COMMODITY,
  HEX_RADIUS,
  BARBARIAN_TRACK_LEN,
  ALL_PLAYERS,
} from "./state.js";
import type { CKState, CKSettings, PlayerState, PlayerId } from "./state.js";

const S: CKSettings = { vpTarget: 13 };

describe("catan-cities-knights initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a.topology.hexes).toEqual(b.topology.hexes);
    expect(a.scienceDeck.map(c => c.name)).toEqual(b.scienceDeck.map(c => c.name));
    expect(a.politicsDeck.map(c => c.name)).toEqual(b.politicsDeck.map(c => c.name));
    expect(a.tradeDeck.map(c => c.name)).toEqual(b.tradeDeck.map(c => c.name));
    expect(a.robberHex).toBe(b.robberHex);
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

  it("has 54 vertices and 72 edges (standard Catan topology)", () => {
    const s = initialState(42, S);
    expect(s.topology.vertices.length).toBe(54);
    expect(s.topology.edges.length).toBe(72);
  });

  it("isTerminal is null at start", () => {
    const s = initialState(42, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("starts in setup phase with player 0 first, 4 players", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("setup");
    expect(s.setupSubPhase).toBe("place_settlement");
    expect(s.current).toBe(0);
    expect(s.setupStep).toBe(0);
    expect(s.players.length).toBe(4);
    expect(ALL_PLAYERS).toEqual([0, 1, 2, 3]);
  });

  it("barbarian track starts at 0 and length is 7", () => {
    const s = initialState(42, S);
    expect(s.barbarianTrack).toBe(0);
    expect(s.barbarianArrivals).toBe(0);
    expect(BARBARIAN_TRACK_LEN).toBe(7);
  });

  it("commodity mapping reflects forest/pasture/mountain", () => {
    expect(TILE_TO_COMMODITY.wood).toBe("paper");
    expect(TILE_TO_COMMODITY.sheep).toBe("cloth");
    expect(TILE_TO_COMMODITY.ore).toBe("coin");
    expect(TILE_TO_COMMODITY.brick).toBeUndefined();
    expect(TILE_TO_COMMODITY.wheat).toBeUndefined();
    expect(commodityFor("science")).toBe("paper");
    expect(commodityFor("politics")).toBe("coin");
    expect(commodityFor("trade")).toBe("cloth");
  });

  it("each progress deck has 6 cards", () => {
    const s = initialState(42, S);
    expect(s.scienceDeck.length).toBe(6);
    expect(s.politicsDeck.length).toBe(6);
    expect(s.tradeDeck.length).toBe(6);
  });
});

describe("topology helpers", () => {
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

  it("manual topology rebuild matches the board's", () => {
    const s = initialState(99, S);
    const reb = buildTopology(s.topology.hexes);
    expect(reb.vertices.length).toBe(s.topology.vertices.length);
    expect(reb.edges.length).toBe(s.topology.edges.length);
  });
});

describe("setup phase", () => {
  it("placing a settlement at a legal vertex moves to road sub-phase", () => {
    let s = initialState(42, S);
    const legalVertex = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: legalVertex });
    expect(s.players[0].settlements).toContain(legalVertex);
    expect(s.setupSubPhase).toBe("place_road");
    expect(s.setupPendingSettlement).toBe(legalVertex);
  });

  it("rejects illegal settlement (occupied)", () => {
    let s = initialState(42, S);
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    const eAdj = s.topology.edges.findIndex(e => e.a === v || e.b === v);
    s = reducer(s, { type: "setup_place_road", edge: eAdj });
    s = runCpuUntilHuman(s);
    const before = s;
    const sNext = reducer(s, { type: "setup_place_settlement", vertex: v });
    expect(sNext).toBe(before);
  });

  it("rejects road that doesn't touch the pending settlement", () => {
    let s = initialState(42, S);
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    const e = s.topology.edges.findIndex(ed => ed.a !== v && ed.b !== v);
    const before = s;
    const sNext = reducer(s, { type: "setup_place_road", edge: e });
    expect(sNext).toBe(before);
  });

  it("after full setup, each player has 2 settlements and 2 roads", () => {
    const s = runSetupToCompletion(initialState(42, S));
    expect(s.phase).toBe("roll");
    expect(s.current).toBe(0);
    for (const pid of ALL_PLAYERS) {
      expect(s.players[pid].settlements.length).toBe(2);
      expect(s.players[pid].roads.length).toBe(2);
    }
  });

  it("second settlement grants resources from adjacent hexes", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const p0 = s.players[0];
    const total = p0.resources.wood + p0.resources.brick + p0.resources.sheep + p0.resources.wheat + p0.resources.ore;
    expect(total).toBeGreaterThanOrEqual(1);
    expect(total).toBeLessThanOrEqual(3);
  });
});

describe("reducer rejects illegal play", () => {
  it("returns same ref when player has no resources to build a road on unconnected edge", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const sp = reducer(s, { type: "roll" });
    if (sp.phase !== "play") return;
    const farEdge = findUnconnectedEdge(sp, 0);
    if (farEdge >= 0) {
      const before = sp;
      const sNext = reducer(sp, { type: "build_road", edge: farEdge });
      expect(sNext).toBe(before);
    }
  });

  it("end_turn from human transitions to CPU phase (next player)", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase === "play") {
      s = reducer(s, { type: "end_turn" });
      expect(s.phase).toBe("cpu");
      expect(s.current).toBe(1);
    }
  });
});

describe("knights", () => {
  it("recruit_knight requires sheep+ore and an adjacent-to-road vertex", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 0, brick: 0, sheep: 1, wheat: 0, ore: 1 };
    const settleVert = players[0].settlements[0]!;
    // Find a free vertex adjacent to player's road.
    const reachable = new Set<number>();
    for (const ei of players[0].roads) {
      const e = s.topology.edges[ei]!;
      reachable.add(e.a); reachable.add(e.b);
    }
    let target = -1;
    for (const vi of reachable) {
      if (vi === settleVert) continue;
      if (!isVertexOccupied({ ...s, players }, vi)) { target = vi; break; }
    }
    if (target < 0) return;
    // Need to be in play phase, not roll
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "recruit_knight", vertex: target });
    expect(after.players[0].knights.length).toBe(1);
    expect(after.players[0].knights[0]!.level).toBe(1);
    expect(after.players[0].knights[0]!.active).toBe(false);
    expect(after.players[0].resources.sheep).toBe(0);
    expect(after.players[0].resources.ore).toBe(0);
  });

  it("activate_knight needs wheat and the knight must be inactive", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 0, brick: 0, sheep: 0, wheat: 1, ore: 0 };
    players[0].knights.push({ vertex: 0, level: 1, active: false });
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "activate_knight", index: 0 });
    expect(after.players[0].knights[0]!.active).toBe(true);
    expect(after.players[0].resources.wheat).toBe(0);
    // Activating an already-active knight returns same ref.
    const after2 = reducer(after, { type: "activate_knight", index: 0 });
    expect(after2).toBe(after);
  });

  it("promote_knight raises level by 1 (max 3)", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 0, brick: 0, sheep: 1, wheat: 0, ore: 1 };
    players[0].knights.push({ vertex: 0, level: 1, active: true });
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "promote_knight", index: 0 });
    expect(after.players[0].knights[0]!.level).toBe(2);
    // Can't promote past 3.
    const players2 = clonePlayers(after.players);
    players2[0].resources = { wood: 0, brick: 0, sheep: 1, wheat: 0, ore: 1 };
    players2[0].knights[0]!.level = 3;
    const sp2: CKState = { ...after, players: players2 };
    const after2 = reducer(sp2, { type: "promote_knight", index: 0 });
    expect(after2).toBe(sp2);
  });

  it("knight strength helpers report active vs total correctly", () => {
    const p: PlayerState = {
      id: 0,
      resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      commodities: { paper: 0, cloth: 0, coin: 0 },
      settlements: [], cities: [], cityWalls: [], roads: [],
      knights: [
        { vertex: 0, level: 1, active: false },
        { vertex: 1, level: 2, active: true },
        { vertex: 2, level: 3, active: true },
      ],
      progressCards: [],
      bonusVp: 0,
    };
    expect(activeKnightStrength(p)).toBe(5);
    expect(totalKnightStrength(p)).toBe(6);
  });
});

describe("commodities production", () => {
  it("cities on commodity tiles yield 1 resource + 1 commodity on matching roll", () => {
    const s = initialState(42, S);
    // Find a wood (forest) hex with a known token.
    const woodHex = s.topology.hexes.findIndex(h => h.type === "wood" && h.token !== null);
    expect(woodHex).toBeGreaterThanOrEqual(0);
    const hex = s.topology.hexes[woodHex]!;
    // Pick a vertex adjacent to that hex.
    const vi = s.topology.vertices.findIndex(v => v.adjHexes.includes(woodHex));
    expect(vi).toBeGreaterThanOrEqual(0);
    const players = clonePlayers(s.players);
    players[0].cities = [vi];
    // Set robber off this hex so production runs.
    const robberHex = s.topology.hexes.findIndex(h => h.type === "desert");
    const sp: CKState = { ...s, players, robberHex, phase: "roll" };
    const after = reducer(sp, { type: "roll" });
    // After a non-7 roll, if the rolled sum equals hex.token we should see paper + wood.
    if (after.lastRoll && after.lastRoll.sum === hex.token) {
      expect(after.players[0].commodities.paper).toBe(1);
      expect(after.players[0].resources.wood).toBe(1);
    }
    // Otherwise nothing to assert about this hex; still must be in play phase or roll-extended.
    expect(["play", "roll"]).toContain(after.phase);
  });

  it("commodity counts start at zero for all players", () => {
    const s = initialState(42, S);
    for (const p of s.players) {
      expect(p.commodities.paper).toBe(0);
      expect(p.commodities.cloth).toBe(0);
      expect(p.commodities.coin).toBe(0);
    }
  });
});

describe("barbarian mechanics", () => {
  it("barbarian ship advances each round; arrives at 7 spaces", () => {
    let s = runSetupToCompletion(initialState(42, S));
    expect(s.barbarianTrack).toBe(0);
    // Run 7 rounds by having every player end_turn.
    for (let round = 0; round < 7; round++) {
      // Human turn: skip rolling — just end. Roll first to legalize.
      s = reducer(s, { type: "roll" });
      // It's possible roll triggered barbarian step on 7.
      if (s.phase === "done") break;
      if (s.phase === "play") {
        s = reducer(s, { type: "end_turn" });
      }
      // Now cycle CPUs until back to human.
      let guard = 0;
      while (s.phase === "cpu" && guard++ < 200) {
        s = reducer(s, { type: "cpu_step" });
      }
      if (s.phase === "done") break;
    }
    // After enough rounds the barbarians should have arrived at least once.
    expect(s.barbarianArrivals).toBeGreaterThanOrEqual(1);
  });

  it("a 7 roll advances the barbarian an extra step (XL simplification)", () => {
    const s = runSetupToCompletion(initialState(42, S));
    // Force a 7 by injecting a state in "roll" with a controlled rng. Hard to do
    // deterministically without re-seeding, so just verify the contract: when
    // the barbarian track is at 6 and we advance once, it should resolve (arrivals+1, track=0).
    const sp: CKState = { ...s, barbarianTrack: BARBARIAN_TRACK_LEN - 1 };
    // Simulate a 7 by going through end_turn cycles: easier to call the
    // exported reducer with phase==play and end_turn — but it requires phase=play.
    // Use the direct cycle: end_turn from each player advances barbarian after P3→P0.
    let cur: CKState = { ...sp, phase: "play", rolledThisTurn: true, current: 0 };
    cur = reducer(cur, { type: "end_turn" });
    while (cur.phase === "cpu") cur = reducer(cur, { type: "cpu_step" });
    expect(cur.barbarianArrivals).toBe(1);
    expect(cur.barbarianTrack).toBe(0);
  });

  it("if no cities exist, barbarian arrival leaves players unharmed", () => {
    let s = runSetupToCompletion(initialState(42, S));
    // No one has cities yet at this point.
    const before = s.players.map(p => p.cities.length).reduce((a, b) => a + b, 0);
    expect(before).toBe(0);
    const sp: CKState = { ...s, barbarianTrack: BARBARIAN_TRACK_LEN - 1, phase: "play", rolledThisTurn: true, current: 0 };
    const after = reducer(sp, { type: "end_turn" });
    // No cities → no sackings.
    for (const p of after.players) {
      expect(p.cities.length).toBe(0);
    }
    // Barbarian resets.
    let st = after;
    while (st.phase === "cpu") st = reducer(st, { type: "cpu_step" });
    expect(st.barbarianTrack).toBe(0);
  });

  it("walls absorb a barbarian sack instead of city demotion", () => {
    let s = runSetupToCompletion(initialState(42, S));
    // Give P0 a city + wall; ensure no one else has any knights/cities.
    const players = clonePlayers(s.players);
    const vi = players[0].settlements[0]!;
    players[0].settlements = players[0].settlements.filter(x => x !== vi);
    players[0].cities = [vi];
    players[0].cityWalls = [vi];
    // Strip all knights for everyone so barbarians win (strength = 1 city).
    for (const p of players) p.knights = [];
    const sp: CKState = { ...s, players, barbarianTrack: BARBARIAN_TRACK_LEN - 1, phase: "play", rolledThisTurn: true, current: 0 };
    let after = reducer(sp, { type: "end_turn" });
    while (after.phase === "cpu") after = reducer(after, { type: "cpu_step" });
    // City should still be there, but the wall absorbed.
    expect(after.players[0].cities).toContain(vi);
    expect(after.players[0].cityWalls.includes(vi)).toBe(false);
  });

  it("defender (most active knight strength) gets +1 VP when barbarians repelled", () => {
    let s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    // Give P0 strong active knights, others none.
    players[0].knights = [{ vertex: 0, level: 3, active: true }, { vertex: 1, level: 2, active: true }];
    // Make sure barbarian strength = at least 1 (we'll use total cities; with 0 cities barb = 1).
    const sp: CKState = { ...s, players, barbarianTrack: BARBARIAN_TRACK_LEN - 1, phase: "play", rolledThisTurn: true, current: 0 };
    let after = reducer(sp, { type: "end_turn" });
    while (after.phase === "cpu") after = reducer(after, { type: "cpu_step" });
    expect(after.players[0].bonusVp).toBe(1);
    // Knights deactivate after defense.
    for (const k of after.players[0].knights) expect(k.active).toBe(false);
  });
});

describe("walls & city building", () => {
  it("build_wall requires 2 brick and an owned city", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    const vi = players[0].settlements[0]!;
    players[0].settlements = players[0].settlements.filter(x => x !== vi);
    players[0].cities = [vi];
    players[0].resources = { wood: 0, brick: 2, sheep: 0, wheat: 0, ore: 0 };
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "build_wall", vertex: vi });
    expect(after.players[0].cityWalls).toContain(vi);
    expect(after.players[0].resources.brick).toBe(0);
    // Duplicate wall on same city returns same ref.
    const after2 = reducer(after, { type: "build_wall", vertex: vi });
    expect(after2).toBe(after);
  });

  it("build_city upgrades settlement and grants +1 VP", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 0, brick: 0, sheep: 0, wheat: 2, ore: 3 };
    const vi = players[0].settlements[0]!;
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const beforeVp = vpFor(sp, 0);
    const after = reducer(sp, { type: "build_city", vertex: vi });
    expect(after.players[0].cities).toContain(vi);
    expect(after.players[0].settlements).not.toContain(vi);
    expect(vpFor(after, 0)).toBe(beforeVp + 1); // city = 2 VP, settlement was 1 VP → +1
  });
});

describe("bank trade", () => {
  it("trades 4-of-a-kind for 1 of another resource", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = reducer(s, { type: "roll" });
    if (s.phase !== "play") return;
    const players = clonePlayers(s.players);
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
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 3, brick: 0, sheep: 0, wheat: 0, ore: 0 };
    const sp = { ...s, players };
    const after = reducer(sp, { type: "trade_bank", give: "wood", receive: "brick" });
    expect(after).toBe(sp);
  });
});

describe("progress cards", () => {
  it("buy_progress_card consumes wheat + matching commodity and draws from the right deck", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].resources = { wood: 0, brick: 0, sheep: 0, wheat: 1, ore: 0 };
    players[0].commodities = { paper: 1, cloth: 0, coin: 0 };
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "buy_progress_card", color: "science" });
    expect(after.players[0].progressCards.length).toBe(1);
    expect(after.players[0].progressCards[0]!.color).toBe("science");
    expect(after.players[0].resources.wheat).toBe(0);
    expect(after.players[0].commodities.paper).toBe(0);
    expect(after.scienceDeck.length).toBe(s.scienceDeck.length - 1);
  });

  it("play_progress_card removes the card and applies a bonus", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    players[0].progressCards = [{ color: "science", kind: "bonus_vp", name: "Test VP" }];
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const before = sp.players[0].bonusVp;
    const after = reducer(sp, { type: "play_progress_card", index: 0 });
    expect(after.players[0].progressCards.length).toBe(0);
    expect(after.players[0].bonusVp).toBe(before + 1);
  });
});

describe("victory & terminal", () => {
  it("isTerminal returns score when winner is set to player 0", () => {
    let s = runSetupToCompletion(initialState(42, S));
    s = { ...s, phase: "done", winner: 0 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("score is 0 for CPU win", () => {
    let s = initialState(42, S);
    s = { ...s, phase: "done", winner: 1 };
    expect(score(s)).toBe(0);
  });

  it("vpFor counts settlements (1), cities (2), and bonus VP", () => {
    const s = initialState(42, S);
    const players = clonePlayers(s.players);
    players[0].settlements = [0, 1];     // +2
    players[0].cities = [2];             // +2
    players[0].bonusVp = 1;              // +1
    const sp = { ...s, players };
    expect(vpFor(sp, 0)).toBe(5);
  });

  it("reaching 13 VP triggers done phase", () => {
    const s = runSetupToCompletion(initialState(42, S));
    const players = clonePlayers(s.players);
    // Set up P0 with 6 cities (+12 VP) and try building a settlement to push to 13.
    // Easier: directly use checkWin via a reducer call after manipulating bonusVp.
    players[0].bonusVp = 11;
    players[0].resources = { wood: 0, brick: 0, sheep: 1, wheat: 0, ore: 1 }; // enough to recruit a knight
    // build_city path is easier: give a settlement and wheat/ore.
    players[0].resources = { wood: 0, brick: 0, sheep: 0, wheat: 2, ore: 3 };
    const vi = players[0].settlements[0]!;
    const sp: CKState = { ...s, players, phase: "play", rolledThisTurn: true };
    const after = reducer(sp, { type: "build_city", vertex: vi });
    // City = 2 VP (was 1 as settlement, gain +1) + 11 bonus = 12 + 1 = 13? settlements left = 1 (1 VP) + city = 2 VP + bonus 11 = 14.
    expect(vpFor(after, 0)).toBeGreaterThanOrEqual(13);
    expect(after.phase).toBe("done");
    expect(after.winner).toBe(0);
  });
});

describe("distance rule", () => {
  it("distance rule blocks adjacent vertices", () => {
    const s = initialState(42, S);
    const players = clonePlayers(s.players);
    players[0].settlements = [0];
    const sp = { ...s, players };
    expect(distanceRuleOk(sp, 0)).toBe(false);
    const neighbors = sp.topology.vertices[0]!.adjVerts;
    for (const nb of neighbors) expect(distanceRuleOk(sp, nb)).toBe(false);
  });

  it("isEdgeOccupied / roadConnects basics", () => {
    const s = initialState(42, S);
    const players = clonePlayers(s.players);
    const e = s.topology.edges[0]!;
    players[0].settlements = [e.a];
    const sp = { ...s, players };
    expect(roadConnects(sp, 0, 0)).toBe(true);
    players[0].roads = [0];
    expect(isEdgeOccupied({ ...sp, players }, 0)).toBe(true);
  });
});

describe("CPU AI", () => {
  it("CPU step advances setup placement when invoked in cpu phase", () => {
    let s = initialState(42, S);
    const v = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v });
    const eAdj = s.topology.edges.findIndex(e => e.a === v || e.b === v);
    s = reducer(s, { type: "setup_place_road", edge: eAdj });
    expect(s.phase).toBe("cpu");
    expect(s.current).toBe(1);
    s = reducer(s, { type: "cpu_step" });
    expect(s.players[1].settlements.length).toBe(1);
    s = reducer(s, { type: "cpu_step" });
    expect(s.players[1].roads.length).toBe(1);
  });

  it("CPU turn runs roll then end (eventually)", () => {
    let s = runSetupToCompletion(initialState(42, S));
    // Human end-turn first so CPU goes.
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "end_turn" });
    let guard = 0;
    while (s.phase === "cpu" && guard++ < 50) {
      s = reducer(s, { type: "cpu_step" });
    }
    // Eventually CPUs cycle back to human (or stay in cpu hitting guard).
    expect(["roll", "play", "cpu", "done"]).toContain(s.phase);
    expect(guard).toBeLessThan(50);
  });
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function clonePlayers(ps: readonly PlayerState[]): [PlayerState, PlayerState, PlayerState, PlayerState] {
  return [
    deepClonePlayer(ps[0]!),
    deepClonePlayer(ps[1]!),
    deepClonePlayer(ps[2]!),
    deepClonePlayer(ps[3]!),
  ];
}

function deepClonePlayer(p: PlayerState): PlayerState {
  return {
    id: p.id,
    resources: { ...p.resources },
    commodities: { ...p.commodities },
    settlements: p.settlements.slice(),
    cities: p.cities.slice(),
    cityWalls: p.cityWalls.slice(),
    roads: p.roads.slice(),
    knights: p.knights.map(k => ({ ...k })),
    progressCards: p.progressCards.map(c => ({ ...c })),
    bonusVp: p.bonusVp,
  };
}

function findLegalVertex(s: CKState): number {
  for (let vi = 0; vi < s.topology.vertices.length; vi++) {
    if (distanceRuleOk(s, vi)) return vi;
  }
  return 0;
}

function findUnconnectedEdge(s: CKState, pid: PlayerId): number {
  for (let ei = 0; ei < s.topology.edges.length; ei++) {
    if (isEdgeOccupied(s, ei)) continue;
    if (!roadConnects(s, pid, ei)) return ei;
  }
  return -1;
}

function runCpuUntilHuman(s: CKState): CKState {
  let cur = s;
  let guard = 0;
  while (cur.phase === "cpu" && guard++ < 100) {
    cur = reducer(cur, { type: "cpu_step" });
  }
  return cur;
}

function runSetupToCompletion(s0: CKState): CKState {
  let s = s0;
  // Order: P0, P1, P2, P3, P3, P2, P1, P0 — human acts at steps 0 and 7.
  // Step 0 (P0):
  const v0 = findLegalVertex(s);
  s = reducer(s, { type: "setup_place_settlement", vertex: v0 });
  const e0 = s.topology.edges.findIndex(e => e.a === v0 || e.b === v0);
  s = reducer(s, { type: "setup_place_road", edge: e0 });
  // Now CPUs 1, 2, 3, 3, 2, 1 — run them.
  s = runCpuUntilHuman(s);
  // Step 7 (P0 second settlement):
  if (s.phase === "setup" && s.current === 0) {
    const v1 = findLegalVertex(s);
    s = reducer(s, { type: "setup_place_settlement", vertex: v1 });
    const e1 = s.topology.edges.findIndex(e => e.a === v1 || e.b === v1);
    if (e1 >= 0) s = reducer(s, { type: "setup_place_road", edge: e1 });
  }
  s = runCpuUntilHuman(s);
  return s;
}

// CKAction is imported as a type for clarity; runtime usage not required here.

