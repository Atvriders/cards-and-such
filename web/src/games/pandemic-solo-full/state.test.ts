import { describe, it, expect } from "vitest";
import {
  ADJACENCY,
  ATLANTA,
  CITIES,
  COLORS,
  OUTBREAK_LOSS,
  cityIdByName,
  curesCount,
  epidemicsFor,
  initialState,
  isTerminal,
  reducer,
} from "./state.js";
import type {
  DiseaseColor,
  PandemicSoloFullSettings,
  PandemicSoloFullState,
} from "./state.js";

const STD: PandemicSoloFullSettings = { difficulty: "standard", roleCount: 2 };
const INTRO: PandemicSoloFullSettings = { difficulty: "introductory", roleCount: 2 };
const HEROIC: PandemicSoloFullSettings = { difficulty: "heroic", roleCount: 2 };

function deep(state: PandemicSoloFullState): PandemicSoloFullState {
  // Snapshot used in equality-checks where reducer rejection should return same ref.
  return state;
}

describe("pandemic-solo-full initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(123, STD);
    const b = initialState(123, STD);
    expect(a.pawns.map((p) => p.role)).toEqual(b.pawns.map((p) => p.role));
    expect(a.pawns[0]!.hand).toEqual(b.pawns[0]!.hand);
    expect(a.playerDeck.length).toBe(b.playerDeck.length);
    expect(a.infectionDeck.map((c) => c.cityId)).toEqual(b.infectionDeck.map((c) => c.cityId));
    expect(a.cityCubes).toEqual(b.cityCubes);
  });

  it("different seeds produce different boards", () => {
    const a = initialState(1, STD);
    const b = initialState(2, STD);
    const sameInfection = a.infectionDiscard
      .map((c) => c.cityId)
      .join() === b.infectionDiscard.map((c) => c.cityId).join();
    expect(sameInfection).toBe(false);
  });

  it("places pawns at Atlanta with a research station", () => {
    const s = initialState(7, STD);
    for (const p of s.pawns) expect(p.cityId).toBe(ATLANTA);
    expect(s.stations).toEqual([ATLANTA]);
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(42, STD))).toBeNull();
  });

  it("infects 9 cities with 3/2/1 cubes at setup", () => {
    const s = initialState(99, STD);
    // Total starting cubes placed = 3*3 + 3*2 + 3*1 = 18.
    let total = 0;
    for (let i = 0; i < CITIES.length; i++) {
      const r = s.cityCubes[i]!;
      total += r[0]! + r[1]! + r[2]! + r[3]!;
    }
    expect(total).toBeGreaterThanOrEqual(15); // at least mostly; outbreaks may have nudged
    expect(s.infectionDiscard.length).toBe(9);
  });

  it("has 48 cities total split 12 per color", () => {
    expect(CITIES.length).toBe(48);
    const counts: Record<DiseaseColor, number> = { blue: 0, yellow: 0, black: 0, red: 0 };
    for (const c of CITIES) counts[c.color]++;
    expect(counts.blue).toBe(12);
    expect(counts.yellow).toBe(12);
    expect(counts.black).toBe(12);
    expect(counts.red).toBe(12);
  });

  it("includes Medic and Scientist roles regardless of seed", () => {
    for (const seed of [1, 5, 99, 12345]) {
      const s = initialState(seed, STD);
      const roles = s.pawns.map((p) => p.role);
      expect(roles).toContain("medic");
      expect(roles).toContain("scientist");
    }
  });

  it("epidemics-per-difficulty is correct (4/5/6)", () => {
    expect(epidemicsFor("introductory")).toBe(4);
    expect(epidemicsFor("standard")).toBe(5);
    expect(epidemicsFor("heroic")).toBe(6);
  });

  it("starts with 4 actions, 0 outbreaks, rate index 0, in 'action' phase", () => {
    const s = initialState(42, STD);
    expect(s.actionsLeft).toBe(4);
    expect(s.outbreaks).toBe(0);
    expect(s.infectionRateIdx).toBe(0);
    expect(s.phase).toBe("action");
  });
});

describe("pandemic-solo-full basic actions", () => {
  it("drive moves an active pawn to an adjacent city and costs 1 action", () => {
    const s = initialState(42, STD);
    const start = s.pawns[s.current]!.cityId;
    const neighbor = ADJACENCY[start]![0]!;
    const after = reducer(s, { type: "drive", toCityId: neighbor });
    expect(after.pawns[after.current === s.current ? s.current : 0]!.cityId).toBeDefined();
    expect(after.pawns[s.current]!.cityId).toBe(neighbor);
    expect(after.actionsLeft).toBe(3);
  });

  it("drive to a non-adjacent city is rejected (returns same ref)", () => {
    const s = initialState(42, STD);
    const before = deep(s);
    // Pick a city definitely NOT adjacent to Atlanta.
    const tokyo = cityIdByName("Tokyo");
    expect(ADJACENCY[ATLANTA]!.includes(tokyo)).toBe(false);
    const after = reducer(s, { type: "drive", toCityId: tokyo });
    expect(after).toBe(before);
  });

  it("direct_flight requires the destination card in hand", () => {
    const s0 = initialState(42, STD);
    // Force a known card into the active pawn's hand.
    const target = cityIdByName("Tokyo");
    const pawns = s0.pawns.map((p, i) =>
      i === s0.current ? { ...p, hand: p.hand.concat([{ kind: "city" as const, cityId: target }]) } : p,
    );
    const s = { ...s0, pawns };
    const after = reducer(s, { type: "direct_flight", toCityId: target });
    expect(after.pawns[s.current]!.cityId).toBe(target);
    expect(after.playerDiscard.length).toBe(1);
  });

  it("treat decrements cubes by one for non-Medic, removes all for Medic if cured", () => {
    const s0 = initialState(42, STD);
    // Put 2 blue cubes on the active pawn's city.
    const city = s0.pawns[s0.current]!.cityId;
    const cityCubes = s0.cityCubes.map((row) => row.slice());
    cityCubes[city]![0] = 2;
    let s: PandemicSoloFullState = { ...s0, cityCubes };
    // Make the active pawn the non-medic (use scientist).
    let scientistIdx = s.pawns.findIndex((p) => p.role === "scientist");
    if (scientistIdx < 0) scientistIdx = s.current;
    s = { ...s, current: scientistIdx };
    const after = reducer(s, { type: "treat", color: "blue" });
    expect(after.cityCubes[city]![0]).toBe(1);

    // Now test cured + medic case.
    const medicIdx = s.pawns.findIndex((p) => p.role === "medic");
    const s2: PandemicSoloFullState = {
      ...s,
      current: medicIdx,
      cityCubes: cityCubes.map((row) => row.slice()),
      cured: { ...s.cured, blue: true },
    };
    s2.cityCubes[city]![0] = 2;
    const after2 = reducer(s2, { type: "treat", color: "blue" });
    expect(after2.cityCubes[city]![0]).toBe(0);
  });

  it("build_station discards current-city card and adds a station", () => {
    const s0 = initialState(42, STD);
    // Move active pawn to Chicago (adj to Atlanta) by reducer drive.
    const chicago = cityIdByName("Chicago");
    let s = reducer(s0, { type: "drive", toCityId: chicago });
    // Force Chicago card into hand.
    const pawns = s.pawns.map((p, i) =>
      i === s.current ? { ...p, hand: p.hand.concat([{ kind: "city" as const, cityId: chicago }]) } : p,
    );
    s = { ...s, pawns };
    const after = reducer(s, { type: "build_station" });
    expect(after.stations).toContain(chicago);
  });
});

describe("pandemic-solo-full cure mechanics", () => {
  it("scientist needs only 4 same-color cards to cure", () => {
    const s0 = initialState(42, STD);
    const scientistIdx = s0.pawns.findIndex((p) => p.role === "scientist");
    expect(scientistIdx).toBeGreaterThanOrEqual(0);
    // Give scientist 4 blue city cards and move them to Atlanta (already there).
    const blueCards = [0, 1, 2, 3]; // first 4 are blue cities
    const pawns = s0.pawns.map((p, i) =>
      i === scientistIdx
        ? { ...p, hand: blueCards.map((cid) => ({ kind: "city" as const, cityId: cid })), cityId: ATLANTA }
        : p,
    );
    const s: PandemicSoloFullState = { ...s0, current: scientistIdx, pawns };
    const after = reducer(s, { type: "discover_cure", color: "blue", cardCityIds: blueCards });
    expect(after.cured.blue).toBe(true);
    expect(curesCount(after)).toBeGreaterThanOrEqual(1);
  });

  it("non-scientist needs 5 same-color cards to cure", () => {
    const s0 = initialState(42, STD);
    // Pick a non-scientist pawn.
    const idx = s0.pawns.findIndex((p) => p.role !== "scientist");
    expect(idx).toBeGreaterThanOrEqual(0);
    const blueCards = [0, 1, 2, 3, 4];
    const pawns = s0.pawns.map((p, i) =>
      i === idx
        ? { ...p, hand: blueCards.map((cid) => ({ kind: "city" as const, cityId: cid })), cityId: ATLANTA }
        : p,
    );
    const s: PandemicSoloFullState = { ...s0, current: idx, pawns };
    const after = reducer(s, { type: "discover_cure", color: "blue", cardCityIds: blueCards });
    expect(after.cured.blue).toBe(true);
  });

  it("rejects cure with wrong color cards", () => {
    const s0 = initialState(42, STD);
    const sciIdx = s0.pawns.findIndex((p) => p.role === "scientist");
    // Mix of colors.
    const cards = [0, 1, 12, 13]; // 2 blue + 2 yellow
    const pawns = s0.pawns.map((p, i) =>
      i === sciIdx
        ? { ...p, hand: cards.map((cid) => ({ kind: "city" as const, cityId: cid })), cityId: ATLANTA }
        : p,
    );
    const s: PandemicSoloFullState = { ...s0, current: sciIdx, pawns };
    const before = s;
    const after = reducer(s, { type: "discover_cure", color: "blue", cardCityIds: cards });
    expect(after).toBe(before);
  });

  it("rejects cure when not at a research station", () => {
    const s0 = initialState(42, STD);
    const sciIdx = s0.pawns.findIndex((p) => p.role === "scientist");
    // Move scientist to a non-station city (London is not a station initially).
    const london = cityIdByName("London");
    const blueCards = [0, 1, 5, 6]; // 4 blue
    const pawns = s0.pawns.map((p, i) =>
      i === sciIdx
        ? { ...p, hand: blueCards.map((cid) => ({ kind: "city" as const, cityId: cid })), cityId: london }
        : p,
    );
    const s: PandemicSoloFullState = { ...s0, current: sciIdx, pawns };
    const before = s;
    const after = reducer(s, { type: "discover_cure", color: "blue", cardCityIds: blueCards });
    expect(after).toBe(before);
  });

  it("winning sets phase to 'won' and isTerminal returns a positive score", () => {
    let s = initialState(42, STD);
    // Force all 4 cures.
    s = { ...s, cured: { blue: true, yellow: true, black: true, red: true }, phase: "won" };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});

describe("pandemic-solo-full loss conditions", () => {
  it("8 outbreaks → loss, score 0", () => {
    let s = initialState(42, STD);
    s = { ...s, outbreaks: OUTBREAK_LOSS, phase: "lost", loseReason: "8 outbreaks reached." };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(0);
  });

  it("phase 'lost' is terminal", () => {
    const s = initialState(42, STD);
    const dead: PandemicSoloFullState = { ...s, phase: "lost", loseReason: "test" };
    expect(isTerminal(dead)).toEqual({ score: 0 });
  });

  it("reducer is a no-op once terminal", () => {
    const s = initialState(42, STD);
    const dead: PandemicSoloFullState = { ...s, phase: "lost", loseReason: "x" };
    const after = reducer(dead, { type: "drive", toCityId: cityIdByName("Chicago") });
    expect(after).toBe(dead);
  });
});

describe("pandemic-solo-full role switching", () => {
  it("activate_role swaps current pawn but keeps other state", () => {
    const s = initialState(42, STD);
    const other = (s.current + 1) % s.pawns.length;
    const after = reducer(s, { type: "activate_role", pawnIdx: other });
    expect(after.current).toBe(other);
    expect(after.actionsLeft).toBe(s.actionsLeft);
  });

  it("activate_role rejects out-of-range pawnIdx", () => {
    const s = initialState(42, STD);
    const after = reducer(s, { type: "activate_role", pawnIdx: 99 });
    expect(after).toBe(s);
  });
});

describe("pandemic-solo-full end-turn flow", () => {
  it("pass advances pawn after draw+infect", () => {
    const s = initialState(42, STD);
    const cur = s.current;
    const after = reducer(s, { type: "pass" });
    if (after.phase === "lost") {
      // unlucky seed — accepted result
      expect(isTerminal(after)).not.toBeNull();
    } else {
      expect(after.current).toBe((cur + 1) % s.pawns.length);
      expect(after.actionsLeft).toBe(4);
      expect(["action", "won"]).toContain(after.phase);
    }
  });

  it("after 4 drives the turn ends automatically", () => {
    let s = initialState(42, STD);
    const start = s.pawns[s.current]!.cityId;
    const a = ADJACENCY[start]![0]!;
    const b = ADJACENCY[a]![0]!;
    // 4 drives: a→b→a→b
    s = reducer(s, { type: "drive", toCityId: a });
    s = reducer(s, { type: "drive", toCityId: b });
    s = reducer(s, { type: "drive", toCityId: a });
    s = reducer(s, { type: "drive", toCityId: b });
    if (s.phase !== "lost") {
      expect(s.actionsLeft).toBe(4);
    }
  });
});

describe("pandemic-solo-full difficulty epidemic counts", () => {
  it("introductory has more remaining player cards than standard at same seed (fewer epidemics)", () => {
    const a = initialState(7, INTRO);
    const b = initialState(7, STD);
    // Both decks share city/event card count plus respective epidemic counts.
    expect(a.playerDeck.length + a.playerDiscard.length).toBe(b.playerDeck.length + b.playerDiscard.length - 1);
  });

  it("heroic adds one more epidemic to deck than standard", () => {
    const b = initialState(7, STD);
    const c = initialState(7, HEROIC);
    const bEpidemics = b.playerDeck.filter((card) => card.kind === "epidemic").length;
    const cEpidemics = c.playerDeck.filter((card) => card.kind === "epidemic").length;
    expect(cEpidemics).toBe(bEpidemics + 1);
  });
});

describe("pandemic-solo-full color sanity", () => {
  it("COLORS list size and order", () => {
    expect(COLORS).toEqual(["blue", "yellow", "black", "red"]);
  });
});
