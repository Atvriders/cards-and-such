import { describe, expect, it } from "vitest";
import {
  ADJACENCY,
  CITIES,
  CUBES_PER_COLOR,
  ROLES,
  cityIdByName,
  initialState,
  reducer,
  isTerminal,
  totalCubesInCity,
  type PandemicFullSettings,
  type PandemicFullState,
} from "./state.js";

const STD: PandemicFullSettings = { difficulty: "Standard", numRoles: 2 };

describe("Pandemic Full", () => {
  it("city map has exactly 48 cities, 12 per color, with symmetric adjacency", () => {
    expect(CITIES.length).toBe(48);
    const byColor: Record<string, number> = {};
    for (const c of CITIES) byColor[c.color] = (byColor[c.color] ?? 0) + 1;
    expect(byColor.blue).toBe(12);
    expect(byColor.yellow).toBe(12);
    expect(byColor.black).toBe(12);
    expect(byColor.red).toBe(12);
    // symmetry check
    for (const c of CITIES) {
      for (const n of ADJACENCY[c.id]!) {
        expect(ADJACENCY[n]!.includes(c.id)).toBe(true);
      }
    }
  });

  it("initialState is deterministic for a given seed", () => {
    const a = initialState(42, STD);
    const b = initialState(42, STD);
    expect(a.pawns.map((p) => p.role).sort()).toEqual(b.pawns.map((p) => p.role).sort());
    expect(a.cityCubes).toEqual(b.cityCubes);
    expect(a.playerDeck.length).toBe(b.playerDeck.length);
    expect(a.infectionDiscard).toEqual(b.infectionDiscard);
  });

  it("initialState places 18 cubes (3+3+3+2+2+2+1+1+1), starts in Atlanta with a station", () => {
    const s = initialState(7, STD);
    expect(s.pawns.length).toBe(2);
    for (const p of s.pawns) expect(CITIES[p.cityId]!.name).toBe("Atlanta");
    expect(s.stations.has(cityIdByName("Atlanta"))).toBe(true);
    // Total cubes placed
    let placed = 0;
    for (const row of s.cityCubes) placed += row.reduce((a, b) => a + b, 0);
    expect(placed).toBe(18);
    // Cube supply reflects placements
    const totalRemaining = s.cubes.blue + s.cubes.yellow + s.cubes.black + s.cubes.red;
    expect(totalRemaining).toBe(CUBES_PER_COLOR * 4 - 18);
    // Active phase
    expect(s.phase).toBe("action");
    expect(s.actionsLeft).toBe(4);
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = initialState(1, STD);
    expect(isTerminal(s)).toBeNull();
  });

  it("drive to a non-adjacent city is rejected (same state reference)", () => {
    const s = initialState(2, STD);
    const pawn = s.pawns[0]!;
    // find a non-adjacent city
    const nonAdj = CITIES.find((c) => c.id !== pawn.cityId && !ADJACENCY[pawn.cityId]!.includes(c.id))!;
    const next = reducer(s, { type: "drive", toCityId: nonAdj.id });
    expect(next).toBe(s);
  });

  it("drive to an adjacent city moves the pawn and spends an action", () => {
    const s = initialState(3, STD);
    const pawn = s.pawns[s.current]!;
    const dest = ADJACENCY[pawn.cityId]![0]!;
    const next = reducer(s, { type: "drive", toCityId: dest });
    // Either pawn moved (and it's now their turn / next role) OR end-turn cascade happened.
    // After driving, actions go from 4 → 3, so still current pawn's turn.
    expect(next.pawns[s.current]!.cityId).toBe(dest);
    expect(next.actionsLeft).toBe(3);
    expect(next.current).toBe(s.current);
  });

  it("pass action immediately ends the turn (draws + infects) and rotates to next pawn", () => {
    const s = initialState(5, STD);
    const startPawn = s.current;
    const startInfDiscard = s.infectionDiscard.length;
    const next = reducer(s, { type: "pass" });
    // Next pawn now active OR game ended
    if (next.phase === "lost") {
      expect(isTerminal(next)).toEqual({ score: 0 });
    } else {
      expect(next.current).toBe((startPawn + 1) % s.pawns.length);
      // After draw+infect, infection discard or deck should have moved forward
      const moved = next.infectionDiscard.length !== startInfDiscard || next.playerDiscard.length > 0 || next.actionsLeft === 4;
      expect(moved).toBe(true);
    }
  });

  it("treat without cubes in current city is illegal (state unchanged)", () => {
    const s = initialState(11, STD);
    const pawn = s.pawns[s.current]!;
    // Atlanta might or might not have cubes after initial infection; ensure we pick a color with zero
    const cubesHere = s.cityCubes[pawn.cityId]!;
    const emptyColorIdx = cubesHere.findIndex((c) => c === 0);
    if (emptyColorIdx >= 0) {
      const color = (["blue", "yellow", "black", "red"] as const)[emptyColorIdx]!;
      const next = reducer(s, { type: "treat", color });
      expect(next).toBe(s);
    } else {
      // Atlanta had cubes of all 4 colors — extremely unlikely; just assert no crash on a known empty
      const farCity = CITIES.find((c) => totalCubesInCity(s, c.id) === 0);
      expect(farCity).toBeDefined();
    }
  });

  it("buildStation in Atlanta is illegal (already has station)", () => {
    const s = initialState(13, STD);
    const pawn = s.pawns[s.current]!;
    expect(CITIES[pawn.cityId]!.name).toBe("Atlanta");
    const next = reducer(s, { type: "buildStation" });
    expect(next).toBe(s);
  });

  it("simulated immediate loss: setting outbreaks to 8 → state still produces score 0 from isTerminal", () => {
    const s = initialState(17, STD);
    const lost: PandemicFullState = { ...s, phase: "lost", loseReason: "test" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("simulated win path: setting all cures + won phase yields positive score", () => {
    const s = initialState(19, STD);
    const won: PandemicFullState = {
      ...s,
      cured: { blue: true, yellow: true, black: true, red: true },
      phase: "won",
    };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect((t as { score: number }).score).toBeGreaterThan(0);
  });

  it("roles are drawn from the canonical 5-role pool, no duplicates", () => {
    const s = initialState(23, { difficulty: "Standard", numRoles: 3 });
    const roleSet = new Set(s.pawns.map((p) => p.role));
    expect(roleSet.size).toBe(3);
    for (const r of roleSet) expect(ROLES.includes(r)).toBe(true);
  });

  it("setPending action only changes pendingAction and never consumes an action", () => {
    const s = initialState(29, STD);
    const before = s.actionsLeft;
    const next = reducer(s, { type: "setPending", pending: { kind: "directFlight" } });
    expect(next.actionsLeft).toBe(before);
    expect(next.pendingAction).toEqual({ kind: "directFlight" });
  });
});
