import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getEffectiveConns, isConnected } from "./state.js";

const s4 = { size: "4" as const };
const s5 = { size: "5" as const };
const s6 = { size: "6" as const };

describe("WireConnect initialState", () => {
  it("creates 4x4 grid with 16 tiles", () => {
    const s = initialState(0, s4);
    expect(s.size).toBe(4);
    expect(s.tiles).toHaveLength(16);
  });

  it("creates 5x5 grid with 25 tiles", () => {
    const s = initialState(0, s5);
    expect(s.tiles).toHaveLength(25);
  });

  it("creates 6x6 grid with 36 tiles", () => {
    const s = initialState(0, s6);
    expect(s.tiles).toHaveLength(36);
  });

  it("source tile is fixed", () => {
    const s = initialState(0, s4);
    expect(s.tiles[s.sourceIndex]!.fixed).toBe(true);
  });
});

describe("getEffectiveConns", () => {
  it("rotation 0 returns original connections", () => {
    const tile = { connections: [true, false, true, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false };
    expect(getEffectiveConns(tile)).toEqual([true, false, true, false]);
  });

  it("rotation 1 rotates 90 degrees clockwise (N->E)", () => {
    // [N,E,S,W] with N=true => after 1 rotation: [W,N,E,S] so W becomes N
    // Original: N=true, others false -> after rotate: [false, true, false, false] (E=true)
    const tile = { connections: [true, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 1, fixed: false };
    const result = getEffectiveConns(tile);
    expect(result[1]).toBe(true); // now east
    expect(result[0]).toBe(false); // north is now false
  });

  it("4 rotations returns to original", () => {
    const tile = { connections: [true, false, true, false] as [boolean,boolean,boolean,boolean], rotation: 4, fixed: false };
    expect(getEffectiveConns(tile)).toEqual([true, false, true, false]);
  });
});

describe("WireConnect reducer", () => {
  it("rotating a tile increments moves", () => {
    const s = initialState(0, s4);
    const nonFixed = s.tiles.findIndex((t, i) => !t.fixed && i !== s.sourceIndex);
    const s2 = reducer(s, { type: "rotate", index: nonFixed });
    expect(s2.moves).toBe(1);
  });

  it("cannot rotate fixed tile", () => {
    const s = initialState(0, s4);
    const s2 = reducer(s, { type: "rotate", index: s.sourceIndex });
    expect(s2).toBe(s);
  });

  it("rotating cycles through 4 states", () => {
    const s = initialState(0, s4);
    const nonFixed = s.tiles.findIndex((t, i) => !t.fixed);
    let cur = s;
    const initialRotation = cur.tiles[nonFixed]!.rotation;
    for (let i = 0; i < 4; i++) cur = reducer(cur, { type: "rotate", index: nonFixed });
    expect(cur.tiles[nonFixed]!.rotation).toBe(initialRotation);
  });

  it("no-op when already won", () => {
    const s = { ...initialState(0, s4), won: true };
    const s2 = reducer(s, { type: "rotate", index: 0 });
    expect(s2).toBe(s);
  });
});

describe("isConnected", () => {
  it("detects connected network", () => {
    // 2 columns, 1 row: tile 0 points east, tile 1 points west — they connect
    const tiles = [
      { connections: [false, true, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: true },
      { connections: [false, false, false, true] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
    ];
    // size=2 means a 2x2 grid (4 tiles), but we only have 2 tiles — test with a manually reduced call
    // Use size=2 and treat it as a 1-row slice: provide 4 tiles (pad with empty ones)
    const tiles4 = [
      ...tiles,
      { connections: [false, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
      { connections: [false, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
    ];
    expect(isConnected(tiles4, 2, 0)).toBe(true);
  });

  it("detects disconnected network", () => {
    const tiles4 = [
      { connections: [false, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: true },
      { connections: [true, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
      { connections: [false, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
      { connections: [false, false, false, false] as [boolean,boolean,boolean,boolean], rotation: 0, fixed: false },
    ];
    expect(isConnected(tiles4, 2, 0)).toBe(false);
  });
});

describe("isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, s4))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, s4), won: true, moves: 10 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
