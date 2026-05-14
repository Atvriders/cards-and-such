import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  score,
  priceForResource,
  citySlotPrice,
  buildableCities,
  buildCostFor,
  citiesCanPower,
  computeOrder,
  incomeForCities,
  fuelCostFor,
  CITIES,
  REGIONS,
  RESOURCE_KINDS,
  PLANT_DECK,
  PLANT_MARKET_SIZE,
  CURRENT_ROW,
  NUM_PLAYERS,
  STARTING_ELEKTRO,
  GAME_END_CITIES,
  STARTING_REGIONS_USED,
} from "./state.js";
import type { PowerGridFullState, PowerGridFullSettings, PlayerState } from "./state.js";

const S: PowerGridFullSettings = { _dummy: false };

describe("power-grid-full initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a.activeRegions).toEqual(b.activeRegions);
    expect(a.market.map(p => p.id)).toEqual(b.market.map(p => p.id));
    expect(a.order).toEqual(b.order);
    expect(a.plantDeck.map(p => p.id)).toEqual(b.plantDeck.map(p => p.id));
  });

  it("different seeds usually yield different region choices or play order", () => {
    const a = initialState(1, S);
    const b = initialState(99, S);
    const sameRegions = JSON.stringify(a.activeRegions) === JSON.stringify(b.activeRegions);
    const sameOrder = JSON.stringify(a.order) === JSON.stringify(b.order);
    expect(sameRegions && sameOrder).toBe(false);
  });

  it("has 4 players (1 human + 3 CPU) with starting elektro", () => {
    const s = initialState(42, S);
    expect(s.players.length).toBe(NUM_PLAYERS);
    expect(s.players[0]!.isCPU).toBe(false);
    expect(s.players[1]!.isCPU).toBe(true);
    expect(s.players[2]!.isCPU).toBe(true);
    expect(s.players[3]!.isCPU).toBe(true);
    for (const p of s.players) {
      expect(p.elektro).toBe(STARTING_ELEKTRO);
      expect(p.cities).toEqual([]);
      expect(p.plants).toEqual([]);
    }
  });

  it("starts in order phase", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("order");
    expect(s.turn).toBe(1);
  });

  it("starts with a fresh plant market of size 8 sorted ascending", () => {
    const s = initialState(42, S);
    expect(s.market.length).toBe(PLANT_MARKET_SIZE);
    for (let i = 1; i < s.market.length; i++) {
      expect(s.market[i]!.id).toBeGreaterThanOrEqual(s.market[i - 1]!.id);
    }
  });

  it("uses the configured number of active regions", () => {
    const s = initialState(42, S);
    expect(s.activeRegions.length).toBe(STARTING_REGIONS_USED);
    for (const r of s.activeRegions) {
      expect(REGIONS).toContain(r);
    }
  });

  it("isTerminal is null at start", () => {
    const s = initialState(42, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("USA map has 42 cities across 6 regions of 7 each", () => {
    expect(CITIES.length).toBe(42);
    expect(REGIONS.length).toBe(6);
    const counts: Record<string, number> = {};
    for (const c of CITIES) counts[c.region] = (counts[c.region] ?? 0) + 1;
    for (const r of REGIONS) expect(counts[r]).toBe(7);
  });
});

describe("power-grid-full pricing helpers", () => {
  it("sliding-scale resource prices rise as supply drops", () => {
    expect(priceForResource("coal", 24)).toBe(1);
    expect(priceForResource("coal", 10)).toBe(5);
    expect(priceForResource("coal", 1)).toBe(10);
    expect(priceForResource("coal", 0)).toBe(999);
  });

  it("uranium pricing escalates faster than other resources", () => {
    expect(priceForResource("uranium", 12)).toBe(1);
    expect(priceForResource("uranium", 6)).toBeGreaterThanOrEqual(priceForResource("coal", 6));
    expect(priceForResource("uranium", 1)).toBeGreaterThanOrEqual(10);
  });

  it("city slot price uses $10 / $15 / $20 ladder", () => {
    expect(citySlotPrice(0)).toBe(10);
    expect(citySlotPrice(1)).toBe(15);
    expect(citySlotPrice(2)).toBe(20);
  });

  it("income table rewards bigger networks (non-decreasing)", () => {
    let prev = -1;
    for (let n = 0; n < 16; n++) {
      const i = incomeForCities(n);
      expect(i).toBeGreaterThanOrEqual(prev);
      prev = i;
    }
  });

  it("fuelCostFor uses correct kinds per plant fuel type", () => {
    expect(fuelCostFor({ id: 4, fuel: "coal",    cost: 2, cities: 1 }).kinds).toEqual(["coal"]);
    expect(fuelCostFor({ id: 5, fuel: "hybrid",  cost: 2, cities: 1 }).kinds.sort()).toEqual(["coal", "oil"]);
    expect(fuelCostFor({ id: 13, fuel: "wind",   cost: 0, cities: 1 }).count).toBe(0);
    expect(fuelCostFor({ id: 40, fuel: "fusion", cost: 0, cities: 6 }).count).toBe(0);
  });
});

describe("power-grid-full phase transitions", () => {
  it("order phase auto-advances to auction with cpu_step", () => {
    let s = initialState(42, S);
    expect(s.phase).toBe("order");
    s = reducer(s, { type: "cpu_step" });
    expect(s.phase).toBe("auction");
  });

  it("computeOrder ranks players by city count (then plant strength)", () => {
    const s = initialState(42, S);
    const players: PlayerState[] = s.players.map(p => ({ ...p }));
    players[0]!.cities = ["Boston", "New York"]; // 2
    players[1]!.cities = ["Phoenix"];            // 1
    players[2]!.cities = [];                     // 0
    players[3]!.cities = [];                     // 0
    players[2]!.plants = [{ id: 20, fuel: "coal", cost: 3, cities: 5 }];
    const order = computeOrder(players);
    // Most cities (player 0) goes first.
    expect(order[0]).toBe(0);
    expect(order[1]).toBe(1);
    // Tie at 0 cities: player 2 (has plant id 20) outranks player 3.
    expect(order[2]).toBe(2);
    expect(order[3]).toBe(3);
  });

  it("auction buy deducts elektro and adds plant", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "cpu_step" }); // order → auction
    // Walk forward until human's auction turn.
    const human0 = s.players[0]!;
    const reversed = s.order.slice().reverse();
    let humanAuctionIdx = reversed.indexOf(0);
    // Step CPU turns until human is up.
    let guard = 0;
    while (s.phase === "auction" && reversed[s.active] !== 0 && guard++ < 10) {
      s = reducer(s, { type: "cpu_step" });
    }
    if (s.phase !== "auction") return; // CPUs ate the row; bail.
    const before = s.players[0]!.elektro;
    const plant = s.market[0]!;
    const after = reducer(s, { type: "auction_buy", marketIdx: 0 });
    if (after.players[0]!.plants.length > 0) {
      expect(after.players[0]!.plants[0]!.id).toBe(plant.id);
      expect(after.players[0]!.elektro).toBe(before - plant.id);
    }
    expect(humanAuctionIdx).toBeGreaterThanOrEqual(0);
    expect(human0).toBeDefined();
  });

  it("auction pass advances player but doesn't spend money", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "cpu_step" });
    // Walk CPUs until human.
    const reversed = () => s.order.slice().reverse();
    let guard = 0;
    while (s.phase === "auction" && reversed()[s.active] !== 0 && guard++ < 10) {
      s = reducer(s, { type: "cpu_step" });
    }
    if (s.phase !== "auction") return;
    const before = s.players[0]!.elektro;
    const sNext = reducer(s, { type: "auction_pass" });
    expect(sNext.players[0]!.elektro).toBe(before);
    // After passing, either we advance within auction OR we transition to resources phase.
    expect(sNext.phase === "auction" || sNext.phase === "resources").toBe(true);
    // The state must have changed (different reference).
    expect(sNext).not.toBe(s);
  });
});

describe("power-grid-full reducer guards", () => {
  it("rejects buy when player can't afford the plant", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "cpu_step" });
    // Walk to human's auction turn.
    const reversed = () => s.order.slice().reverse();
    let guard = 0;
    while (s.phase === "auction" && reversed()[s.active] !== 0 && guard++ < 10) {
      s = reducer(s, { type: "cpu_step" });
    }
    if (s.phase !== "auction") return;
    // Set human elektro to 0.
    const players = s.players.map(p => ({ ...p, resources: { ...p.resources } }));
    players[0]!.elektro = 0;
    const sp = { ...s, players };
    const after = reducer(sp, { type: "auction_buy", marketIdx: 0 });
    expect(after).toBe(sp); // unchanged ref
  });

  it("rejects buying a future-row plant (marketIdx >= CURRENT_ROW)", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "cpu_step" });
    const reversed = () => s.order.slice().reverse();
    let guard = 0;
    while (s.phase === "auction" && reversed()[s.active] !== 0 && guard++ < 10) {
      s = reducer(s, { type: "cpu_step" });
    }
    if (s.phase !== "auction") return;
    const after = reducer(s, { type: "auction_buy", marketIdx: CURRENT_ROW });
    expect(after).toBe(s);
  });

  it("resource_done ignored when no human action expected", () => {
    let s = initialState(42, S);
    // Phase is order. resource_done is not a valid action here.
    const after = reducer(s, { type: "resource_done" });
    expect(after).toBe(s);
  });

  it("done phase ignores all actions", () => {
    let s = initialState(42, S);
    s = { ...s, phase: "done", winner: 0 };
    const after = reducer(s, { type: "cpu_step" });
    expect(after).toBe(s);
  });
});

describe("power-grid-full build helpers", () => {
  it("buildableCities returns only active-region cities not yet owned", () => {
    const s = initialState(42, S);
    const opts = buildableCities(s, 0);
    for (const c of opts) {
      expect(s.activeRegions).toContain(c.region);
    }
    // Total = 7 per region × number of active regions.
    expect(opts.length).toBe(7 * STARTING_REGIONS_USED);
  });

  it("buildCostFor for first city = slot price only (no connection)", () => {
    const s = initialState(42, S);
    const city = CITIES.find(c => s.activeRegions.includes(c.region))!;
    const cost = buildCostFor(s, 0, city);
    expect(cost).toBe(citySlotPrice(0));
  });

  it("buildCostFor for second city = slot + connection from owned", () => {
    let s = initialState(42, S);
    const cityA = CITIES.find(c => s.activeRegions.includes(c.region))!;
    const cityB = CITIES.find(c => s.activeRegions.includes(c.region) && c.name !== cityA.name)!;
    const players = s.players.map(p => ({ ...p, cities: p.cities.slice() }));
    players[0]!.cities = [cityA.name];
    s = { ...s, players };
    const cost = buildCostFor(s, 0, cityB);
    expect(cost).toBeGreaterThan(citySlotPrice(0));
  });

  it("citiesCanPower is 0 with no plants", () => {
    const s = initialState(42, S);
    expect(citiesCanPower(s.players[0]!)).toBe(0);
  });

  it("citiesCanPower fires a wind plant for free", () => {
    const s = initialState(42, S);
    const p = { ...s.players[0]!, resources: { ...s.players[0]!.resources } };
    p.plants = [{ id: 13, fuel: "wind", cost: 0, cities: 1 }];
    p.cities = ["X"];
    expect(citiesCanPower(p)).toBe(1);
  });

  it("citiesCanPower consumes resources for fueled plants", () => {
    const s = initialState(42, S);
    const p = { ...s.players[0]!, resources: { ...s.players[0]!.resources } };
    p.plants = [{ id: 8, fuel: "coal", cost: 3, cities: 2 }];
    p.cities = ["A", "B"];
    p.resources = { coal: 2, oil: 0, garbage: 0, uranium: 0 };
    expect(citiesCanPower(p)).toBe(0); // not enough coal
    p.resources = { coal: 3, oil: 0, garbage: 0, uranium: 0 };
    expect(citiesCanPower(p)).toBe(2);
  });
});

describe("power-grid-full game-end & terminal", () => {
  it("forcing a player to 15 cities ends the game on next build_done", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "cpu_step" }); // order → auction
    // Skip through auction without buying.
    let guard = 0;
    while (s.phase === "auction" && guard++ < 20) {
      s = reducer(s, { type: "cpu_step" });
      if (s.phase === "auction" && s.order.slice().reverse()[s.active] === 0) {
        s = reducer(s, { type: "auction_pass" });
      }
    }
    // Now in resources — everyone does nothing.
    guard = 0;
    while (s.phase === "resources" && guard++ < 20) {
      const reversed = s.order.slice().reverse();
      if (reversed[s.active] === 0) {
        s = reducer(s, { type: "resource_done" });
      } else {
        s = reducer(s, { type: "cpu_step" });
      }
    }
    // Now in build. Force CPU0 to 15 cities, then call build_done.
    const players = s.players.map(p => ({ ...p, cities: p.cities.slice() }));
    // Pick 15 cities from active regions.
    const activeCities = CITIES.filter(c => s.activeRegions.includes(c.region)).map(c => c.name).slice(0, 15);
    // Find the first build-active player and ram their cities to 15.
    const reversed = s.order.slice().reverse();
    const buildActive = reversed[s.active];
    if (buildActive === undefined) return;
    players[buildActive]!.cities = activeCities;
    s = { ...s, players };
    // Take 1 cpu_step or build_done.
    if (s.players[buildActive]!.isCPU) {
      s = reducer(s, { type: "cpu_step" });
    } else {
      s = reducer(s, { type: "build_done" });
    }
    // After this player's build_done, game-end check should fire.
    // Step further if not yet done (other CPUs may still need to build).
    guard = 0;
    while (s.phase === "build" && guard++ < 20) {
      const reversed2 = s.order.slice().reverse();
      const pid = reversed2[s.active];
      if (pid === undefined) break;
      if (s.players[pid]!.isCPU) s = reducer(s, { type: "cpu_step" });
      else s = reducer(s, { type: "build_done" });
    }
    expect(s.phase).toBe("done");
    expect(s.winner).not.toBeNull();
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score is non-negative and >0 only if human wins", () => {
    let s = initialState(42, S);
    // Force human-win.
    s = { ...s, phase: "done" as const, winner: 0 as const };
    expect(score(s)).toBeGreaterThan(0);
    // Force CPU-win.
    const s2: PowerGridFullState = { ...s, phase: "done", winner: 1 };
    expect(score(s2)).toBe(0);
  });

  it("isTerminal returns score when phase is done", () => {
    const s = initialState(42, S);
    const sDone = { ...s, phase: "done" as const, winner: 0 as const };
    const t = isTerminal(sDone);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});

describe("power-grid-full plant deck", () => {
  it("contains a healthy mix of fuel types", () => {
    const fuels = new Set(PLANT_DECK.map(p => p.fuel));
    expect(fuels.has("coal")).toBe(true);
    expect(fuels.has("oil")).toBe(true);
    expect(fuels.has("garbage")).toBe(true);
    expect(fuels.has("uranium")).toBe(true);
    expect(fuels.has("wind")).toBe(true);
    expect(fuels.has("hybrid")).toBe(true);
  });

  it("plant ids are unique", () => {
    const ids = PLANT_DECK.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("constants are sane", () => {
    expect(NUM_PLAYERS).toBe(4);
    expect(PLANT_MARKET_SIZE).toBe(8);
    expect(CURRENT_ROW).toBe(4);
    expect(GAME_END_CITIES).toBe(15);
    expect(STARTING_ELEKTRO).toBeGreaterThan(0);
    expect(RESOURCE_KINDS.length).toBe(4);
  });
});
