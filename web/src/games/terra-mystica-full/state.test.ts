import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  terraformDistance,
  spadeCostFor,
  legalBuildHexes,
  legalUpgrades,
  FACTIONS,
  NUM_PLAYERS,
  NUM_HEXES,
  NUM_ROUNDS,
  CULT_NAMES,
  TERRAIN_LIST,
  BUILDING_COST,
} from "./state.js";
import type {
  TerraMysticaFullState,
  TerraMysticaFullAction,
} from "./state.js";

const settings = { _dummy: false };

function clonePlain<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

describe("terra-mystica-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, settings);
    const b = initialState(42, settings);
    expect(clonePlain(a)).toEqual(clonePlain(b));
  });

  it("differs across seeds (in either map or tile order)", () => {
    const a = initialState(1, settings);
    const b = initialState(99999, settings);
    const equal = JSON.stringify(a.hexes) === JSON.stringify(b.hexes)
      && JSON.stringify(a.scoringTiles) === JSON.stringify(b.scoringTiles);
    expect(equal).toBe(false);
  });

  it("creates 4 players + the correct map dimensions", () => {
    const s = initialState(7, settings);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    expect(s.hexes).toHaveLength(NUM_HEXES);
    expect(s.scoringTiles).toHaveLength(NUM_ROUNDS);
    expect(s.players[0]?.isCpu).toBe(false);
    expect(s.players[1]?.isCpu).toBe(true);
    expect(s.players[2]?.isCpu).toBe(true);
    expect(s.players[3]?.isCpu).toBe(true);
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(0, settings))).toBeNull();
  });

  it("starts in factionSelect phase with each terrain valid", () => {
    const s = initialState(0, settings);
    expect(s.phase).toBe("factionSelect");
    expect(s.round).toBe(1);
    for (const hex of s.hexes) {
      expect(TERRAIN_LIST).toContain(hex.terrain);
      expect(hex.owner).toBe(-1);
      expect(hex.building).toBe("none");
    }
  });
});

describe("terra-mystica-full terraform distance + spade cost", () => {
  it("distance to same terrain is 0", () => {
    expect(terraformDistance("plains", "plains")).toBe(0);
  });

  it("distance is symmetric and cyclic (max 3 for 7 terrains)", () => {
    for (const a of TERRAIN_LIST) {
      for (const b of TERRAIN_LIST) {
        const d = terraformDistance(a, b);
        expect(d).toBe(terraformDistance(b, a));
        expect(d).toBeLessThanOrEqual(Math.floor(TERRAIN_LIST.length / 2));
      }
    }
  });

  it("spadeCostFor returns 0 on home terrain", () => {
    const s = initialState(0, settings);
    const me = s.players[0];
    expect(me).toBeDefined();
    if (!me) return;
    expect(spadeCostFor(me, me.home)).toBe(0);
  });

  it("spade efficiency reduces cost (min 1 when distance > 0)", () => {
    const s = initialState(0, settings);
    const me = s.players[0];
    expect(me).toBeDefined();
    if (!me) return;
    // Find an off-terrain.
    const off = TERRAIN_LIST.find((t) => t !== me.home);
    expect(off).toBeDefined();
    if (!off) return;
    const cost0 = spadeCostFor(me, off);
    const cost2 = spadeCostFor({ ...me, spadeLevel: 2 }, off);
    expect(cost2).toBeLessThanOrEqual(cost0);
    expect(cost2).toBeGreaterThanOrEqual(1);
  });
});

describe("terra-mystica-full selectFaction", () => {
  it("moves to playing phase and sets human faction", () => {
    const s = initialState(0, settings);
    const after = reducer(s, { type: "selectFaction", player: 0, faction: "halflings" });
    expect(after.phase).toBe("playing");
    expect(after.players[0]?.faction).toBe("halflings");
    expect(after.players[0]?.home).toBe("plains");
  });

  it("when the human picks a CPU's default, the CPU is reassigned to a free faction", () => {
    const s = initialState(0, settings);
    const after = reducer(s, { type: "selectFaction", player: 0, faction: "engineers" });
    expect(after.phase).toBe("playing");
    expect(after.players[0]?.faction).toBe("engineers");
    // Each player ends up with a distinct faction.
    const used = new Set(after.players.map((p) => p.faction));
    expect(used.size).toBe(NUM_PLAYERS);
  });

  it("rejects faction-select from a non-human player", () => {
    const s = initialState(0, settings);
    const after = reducer(s, { type: "selectFaction", player: 1, faction: "witches" });
    expect(after).toBe(s);
  });
});

describe("terra-mystica-full build action", () => {
  function setupPlaying(): TerraMysticaFullState {
    const s = initialState(0, settings);
    return reducer(s, { type: "selectFaction", player: 0, faction: "witches" });
  }

  it("builds a dwelling on a home-terrain hex without spending spades", () => {
    let s = setupPlaying();
    // Find a forest hex (Witches' home).
    const homeHex = s.hexes.findIndex((h) => h.terrain === "forest");
    expect(homeHex).toBeGreaterThanOrEqual(0);
    if (homeHex < 0) return;
    const before = s.players[0]!;
    s = reducer(s, { type: "build", player: 0, hex: homeHex });
    const after = s.players[0]!;
    expect(s.hexes[homeHex]?.owner).toBe(0);
    expect(s.hexes[homeHex]?.building).toBe("dwelling");
    expect(after.coin).toBe(before.coin - BUILDING_COST.dwelling.coin);
    expect(after.wood).toBe(before.wood - BUILDING_COST.dwelling.wood);
    expect(after.vp).toBeGreaterThan(before.vp);
    // Active should have moved to next un-passed player.
    expect(s.active).not.toBe(0);
  });

  it("returns same state on an out-of-turn build attempt", () => {
    const s = setupPlaying();
    const after = reducer(s, { type: "build", player: 1, hex: 0 });
    expect(after).toBe(s);
  });

  it("returns same state when target hex is already occupied", () => {
    let s = setupPlaying();
    const homeHex = s.hexes.findIndex((h) => h.terrain === "forest");
    if (homeHex < 0) return;
    s = reducer(s, { type: "build", player: 0, hex: homeHex });
    // Now it's CPU 1's turn; force back to player 0 to try a re-build.
    s = { ...s, active: 0 };
    const after = reducer(s, { type: "build", player: 0, hex: homeHex });
    expect(after).toBe(s);
  });
});

describe("terra-mystica-full upgrade action", () => {
  function withDwelling(): TerraMysticaFullState {
    let s = reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
    const h = s.hexes.findIndex((hex) => hex.terrain === "forest");
    if (h < 0) throw new Error("no forest hex");
    s = reducer(s, { type: "build", player: 0, hex: h });
    // Force back to player 0.
    return { ...s, active: 0 };
  }

  it("upgrades dwelling → trading-house", () => {
    const s = withDwelling();
    const myHex = s.hexes.findIndex((h) => h.owner === 0 && h.building === "dwelling");
    expect(myHex).toBeGreaterThanOrEqual(0);
    if (myHex < 0) return;
    const before = s.players[0]!;
    const after = reducer(s, { type: "upgrade", player: 0, hex: myHex, to: "trading" });
    expect(after).not.toBe(s);
    expect(after.hexes[myHex]?.building).toBe("trading");
    const me = after.players[0]!;
    expect(me.coin).toBe(before.coin - BUILDING_COST.trading.coin);
    expect(me.wood).toBe(before.wood - BUILDING_COST.trading.wood);
    expect(me.vp).toBeGreaterThan(before.vp);
  });

  it("rejects a skip-step upgrade (dwelling → temple)", () => {
    const s = withDwelling();
    const myHex = s.hexes.findIndex((h) => h.owner === 0 && h.building === "dwelling");
    if (myHex < 0) return;
    const after = reducer(s, { type: "upgrade", player: 0, hex: myHex, to: "temple" });
    expect(after).toBe(s);
  });
});

describe("terra-mystica-full cult, shipping, spade-up", () => {
  function inPlay(): TerraMysticaFullState {
    return reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
  }

  it("sending a priest to a cult track advances the cult position", () => {
    const s = inPlay();
    const before = s.players[0]!;
    const after = reducer(s, { type: "cult", player: 0, track: "fire" });
    expect(after).not.toBe(s);
    const me = after.players[0]!;
    expect(me.priests).toBe(before.priests - 1);
    expect(me.cult.fire).toBeGreaterThan(before.cult.fire);
  });

  it("advancing shipping increases shipping level, costs coin + priest", () => {
    const s = inPlay();
    const before = s.players[0]!;
    const after = reducer(s, { type: "shipping", player: 0 });
    expect(after).not.toBe(s);
    const me = after.players[0]!;
    expect(me.shippingLevel).toBe(before.shippingLevel + 1);
    expect(me.coin).toBe(before.coin - 4);
    expect(me.priests).toBe(before.priests - 1);
    expect(me.vp).toBeGreaterThan(before.vp);
  });

  it("spade-up increases spade efficiency", () => {
    const s = inPlay();
    const before = s.players[0]!;
    const after = reducer(s, { type: "spadeUp", player: 0 });
    expect(after).not.toBe(s);
    const me = after.players[0]!;
    expect(me.spadeLevel).toBe(before.spadeLevel + 1);
    expect(me.coin).toBe(before.coin - 5);
    expect(me.priests).toBe(before.priests - 1);
  });
});

describe("terra-mystica-full pass and round flow", () => {
  function inPlay(): TerraMysticaFullState {
    return reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
  }

  it("pass marks the player as passed and advances active", () => {
    const s = inPlay();
    const after = reducer(s, { type: "pass", player: 0 });
    expect(after.players[0]?.passed).toBe(true);
    expect(after.active).not.toBe(0);
  });

  it("everyone passing moves us to scoring phase", () => {
    let s = inPlay();
    for (let p = 0; p < NUM_PLAYERS; p++) {
      // Force active to current pass target so doPass succeeds.
      s = { ...s, active: p };
      s = reducer(s, { type: "pass", player: p });
    }
    expect(s.phase).toBe("scoring");
  });

  it("advanceRound resets passed flags, grants income, increments round", () => {
    let s = inPlay();
    // Quick force everyone to passed for the round.
    s = {
      ...s,
      players: s.players.map((p) => ({ ...p, passed: true })),
      phase: "scoring",
      passOrder: [0, 1, 2, 3],
    };
    const before = s.players[0]!;
    const after = reducer(s, { type: "advanceRound" });
    expect(after.phase).toBe("playing");
    expect(after.round).toBe(2);
    const me = after.players[0]!;
    expect(me.passed).toBe(false);
    expect(me.coin).toBeGreaterThan(before.coin);
    expect(me.wood).toBeGreaterThan(before.wood);
  });

  it("after 6 rounds the game ends and isTerminal returns a score", () => {
    let s = inPlay();
    // Burn through all 6 rounds by force-passing each round.
    for (let r = 0; r < NUM_ROUNDS; r++) {
      s = {
        ...s,
        players: s.players.map((p) => ({ ...p, passed: true })),
        phase: "scoring",
        passOrder: [0, 1, 2, 3],
      };
      s = reducer(s, { type: "advanceRound" });
    }
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    if (term) expect(term.score).toBeGreaterThanOrEqual(0);
  });
});

describe("terra-mystica-full CPU steps", () => {
  it("CPU on its turn modifies state", () => {
    let s = reducer(initialState(11, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
    // After human picks faction, the active player remains 0; pass to advance to CPU 1.
    s = reducer(s, { type: "pass", player: 0 });
    expect(s.active).toBe(1);
    const after = reducer(s, { type: "cpuStep" });
    expect(after).not.toBe(s);
  });

  it("cpuStep on a human's turn returns same state", () => {
    const s = reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
    const after = reducer(s, { type: "cpuStep" });
    expect(after).toBe(s);
  });
});

describe("terra-mystica-full legalBuildHexes + legalUpgrades helpers", () => {
  it("legalBuildHexes lists hexes the human can afford to build on", () => {
    const s = reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
    const list = legalBuildHexes(s, 0);
    // Witches start with 15 coin + 8 wood: should cover several hexes.
    expect(list.length).toBeGreaterThan(0);
    for (const h of list) {
      const hex = s.hexes[h];
      expect(hex).toBeDefined();
      expect(hex?.owner).toBe(-1);
    }
  });

  it("legalUpgrades is empty on a fresh playing-phase state (no buildings owned)", () => {
    const s = reducer(initialState(0, settings), {
      type: "selectFaction",
      player: 0,
      faction: "witches",
    });
    expect(legalUpgrades(s, 0)).toEqual([]);
  });
});

describe("terra-mystica-full miscellaneous", () => {
  it("FACTIONS includes the 4 starter factions with distinct ids", () => {
    expect(FACTIONS).toHaveLength(4);
    const ids = new Set(FACTIONS.map((f) => f.id));
    expect(ids.size).toBe(4);
    expect(ids.has("witches")).toBe(true);
    expect(ids.has("halflings")).toBe(true);
    expect(ids.has("engineers")).toBe(true);
    expect(ids.has("dwarves")).toBe(true);
  });

  it("CULT_NAMES has all 4 tracks", () => {
    expect(CULT_NAMES).toEqual(["fire", "water", "earth", "air"]);
  });

  it("isTerminal returns null while phase !== done", () => {
    const s = initialState(0, settings);
    expect(isTerminal(s)).toBeNull();
    const s2 = reducer(s, { type: "selectFaction", player: 0, faction: "witches" });
    expect(isTerminal(s2)).toBeNull();
  });

  it("reducer ignores unknown action types (returns same reference)", () => {
    const s = initialState(0, settings);
    const bogus = { type: "nope" } as unknown as TerraMysticaFullAction;
    expect(reducer(s, bogus)).toBe(s);
  });
});
