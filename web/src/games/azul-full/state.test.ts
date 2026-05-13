import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  scorePlacement,
  applyEndBonuses,
  rowAccepts,
  legalRowsFor,
  totalTilesRemaining,
  NUM_COLORS,
  NUM_FACTORIES,
  NUM_PLAYERS,
  TILES_PER_FACTORY,
  WALL_PATTERN,
  WALL_SIZE,
  TILES_PER_COLOR,
} from "./state.js";
import type { AzulFullState, Color, PlayerBoard } from "./state.js";

const settings = { cpuLevel: "normal" as const };

function clonePlain<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

describe("azul-full initialState", () => {
  it("is deterministic by seed", () => {
    const a = initialState(42, settings);
    const b = initialState(42, settings);
    expect(clonePlain(a)).toEqual(clonePlain(b));
  });

  it("creates the right number of players, factories, and tiles", () => {
    const s = initialState(1, settings);
    expect(s.players).toHaveLength(NUM_PLAYERS);
    expect(s.factories).toHaveLength(NUM_FACTORIES);
    // Each factory has up to 4 tiles.
    for (const f of s.factories) {
      const total = f.reduce((a, b) => a + b, 0);
      expect(total).toBeLessThanOrEqual(TILES_PER_FACTORY);
      expect(total).toBeGreaterThan(0);
    }
    // 5 factories × 4 tiles = 20 tiles in play; bag should be 100-20=80.
    let onTable = 0;
    for (const f of s.factories) for (const n of f) onTable += n;
    const bagTotal = s.bag.reduce((a, b) => a + b, 0);
    expect(bagTotal + onTable).toBe(NUM_COLORS * TILES_PER_COLOR);
    expect(s.firstPlayerMarkerInCenter).toBe(true);
  });

  it("is not terminal at start", () => {
    expect(isTerminal(initialState(0, settings))).toBeNull();
  });

  it("starts in drafting phase, round 1, active player 0", () => {
    const s = initialState(0, settings);
    expect(s.phase).toBe("drafting");
    expect(s.round).toBe(1);
    expect(s.active).toBe(0);
  });
});

describe("azul-full rowAccepts", () => {
  it("accepts any empty row whose wall slot isn't yet filled", () => {
    const s = initialState(0, settings);
    const board = s.players[0];
    expect(board).toBeDefined();
    if (!board) return;
    expect(rowAccepts(board, 0, 0 as Color)).toBe(true);
    expect(rowAccepts(board, 4, 0 as Color)).toBe(true);
  });

  it("rejects a row whose wall cell for that color is already filled", () => {
    const s = initialState(0, settings);
    const board = s.players[0];
    expect(board).toBeDefined();
    if (!board) return;
    // Fill wall[0][0] (which is Blue/0).
    const newBoard: PlayerBoard = {
      ...board,
      wall: board.wall.map((r, i) => (i === 0 ? [true, false, false, false, false] : r.slice())),
    };
    expect(rowAccepts(newBoard, 0, 0 as Color)).toBe(false);
  });

  it("rejects a row that already contains a different color", () => {
    const s = initialState(0, settings);
    const board = s.players[0];
    expect(board).toBeDefined();
    if (!board) return;
    const newBoard: PlayerBoard = {
      ...board,
      rows: board.rows.map((r, i) => (i === 2 ? [1, -1, -1] : r.slice())) as PlayerBoard["rows"],
    };
    expect(rowAccepts(newBoard, 2, 0 as Color)).toBe(false);
    expect(rowAccepts(newBoard, 2, 1 as Color)).toBe(true);
  });
});

describe("azul-full pick reducer", () => {
  function forceState(): AzulFullState {
    // Construct a controlled state: one factory with 2 blue + 2 red, center empty.
    const s = initialState(0, settings);
    return {
      ...s,
      factories: [
        [2, 0, 2, 0, 0], // factory 0
        [4, 0, 0, 0, 0],
        [0, 4, 0, 0, 0],
        [0, 0, 4, 0, 0],
        [0, 0, 0, 4, 0],
      ],
      center: [0, 0, 0, 0, 0],
      firstPlayerMarkerInCenter: true,
      bag: [0, 0, 0, 0, 0],
      discard: [0, 0, 0, 0, 0],
    };
  }

  it("picks Blue from factory 0 onto pattern row 0 (capacity 1) and overflows the rest", () => {
    const s = forceState();
    const after = reducer(s, {
      type: "pick",
      player: 0,
      source: { kind: "factory", index: 0 },
      color: 0 as Color,
      targetRow: 0,
    });
    const me = after.players[0];
    expect(me).toBeDefined();
    if (!me) return;
    expect(me.rows[0]).toEqual([0]);
    // 2 blue picked, 1 placed on row, 1 overflows to floor.
    expect(me.floor.filter((t) => t === 0)).toHaveLength(1);
    // Remaining red tiles from factory 0 slide to center.
    expect(after.center[2]).toBe(2);
    expect(after.factories[0]).toEqual([0, 0, 0, 0, 0]);
    // Active should advance to player 1.
    expect(after.active).toBe(1);
    // Pick from factory should NOT take the first-player marker.
    expect(after.firstPlayerMarkerInCenter).toBe(true);
    expect(me.floor.some((t) => t === -2)).toBe(false);
  });

  it("rejects an illegal pick (returns same state reference)", () => {
    const s = forceState();
    const after = reducer(s, {
      type: "pick",
      player: 0,
      source: { kind: "factory", index: 0 },
      color: 1 as Color, // yellow not in factory 0
      targetRow: 0,
    });
    expect(after).toBe(s);
  });

  it("rejects picks from a player who isn't active", () => {
    const s = forceState();
    const after = reducer(s, {
      type: "pick",
      player: 1,
      source: { kind: "factory", index: 0 },
      color: 0 as Color,
      targetRow: 0,
    });
    expect(after).toBe(s);
  });

  it("center pick takes the first-player marker the first time", () => {
    const s = forceState();
    const after1 = reducer(s, {
      type: "pick",
      player: 0,
      source: { kind: "factory", index: 0 },
      color: 0 as Color,
      targetRow: 0,
    });
    // Now center has [0,0,2,0,0] and first-player marker still present; CPU 1's turn.
    const after2 = reducer(after1, {
      type: "pick",
      player: 1,
      source: { kind: "center" },
      color: 2 as Color,
      targetRow: 1, // row capacity 2, red is legal
    });
    const cpu1 = after2.players[1];
    expect(cpu1).toBeDefined();
    if (!cpu1) return;
    // First-player marker should land in CPU 1's floor (at the front).
    expect(cpu1.floor.includes(-2)).toBe(true);
    expect(after2.firstPlayerMarkerInCenter).toBe(false);
    expect(after2.nextRoundStarter).toBe(1);
  });
});

describe("azul-full wall scoring", () => {
  it("isolated tile scores 1", () => {
    const wall: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
    if (!wall[2]) throw new Error("row");
    wall[2][2] = true;
    expect(scorePlacement(wall, 2, 2)).toBe(1);
  });

  it("horizontal run of 3 scores 3", () => {
    const wall: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
    if (!wall[1]) throw new Error("row");
    wall[1][0] = true;
    wall[1][1] = true;
    wall[1][2] = true;
    expect(scorePlacement(wall, 1, 2)).toBe(3);
  });

  it("both horizontal and vertical neighbors sum (h + v)", () => {
    const wall: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
    if (!wall[0] || !wall[1] || !wall[2]) throw new Error("rows");
    wall[1][0] = true;
    wall[1][1] = true; // placing here
    wall[0][1] = true;
    wall[2][1] = true;
    // horizontal run: 2 (cells col 0,1) + vertical run: 3 (rows 0,1,2 col 1) = 5
    expect(scorePlacement(wall, 1, 1)).toBe(5);
  });
});

describe("azul-full applyEndBonuses", () => {
  it("adds +2 per complete row, +7 per complete column, +10 per color set", () => {
    const board: PlayerBoard = {
      rows: Array.from({ length: 5 }, (_, r) => Array<Color | -1>(r + 1).fill(-1)),
      wall: Array.from({ length: 5 }, () => Array(5).fill(true)),
      floor: [],
      score: 0,
    };
    // 5 rows × 2 + 5 cols × 7 + 5 colors × 10 = 10 + 35 + 50 = 95.
    const after = applyEndBonuses(board);
    expect(after.score).toBe(95);
  });

  it("partial-only walls receive no bonus", () => {
    const wall: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
    if (!wall[0]) throw new Error("row");
    wall[0][0] = true;
    const board: PlayerBoard = {
      rows: Array.from({ length: 5 }, (_, r) => Array<Color | -1>(r + 1).fill(-1)),
      wall,
      floor: [],
      score: 7,
    };
    const after = applyEndBonuses(board);
    expect(after.score).toBe(7);
  });
});

describe("azul-full tiling + round flow", () => {
  it("after the last pick we move to tiling phase", () => {
    const s = initialState(0, settings);
    // Build a state with one tile in the center and otherwise empty factories.
    const setup: AzulFullState = {
      ...s,
      factories: Array.from({ length: NUM_FACTORIES }, () => [0, 0, 0, 0, 0]),
      center: [1, 0, 0, 0, 0],
      firstPlayerMarkerInCenter: true,
      active: 0,
    };
    const after = reducer(setup, {
      type: "pick",
      player: 0,
      source: { kind: "center" },
      color: 0 as Color,
      targetRow: 0,
    });
    expect(after.phase).toBe("tiling");
  });

  it("advanceTiling clears completed pattern rows onto the wall and scores", () => {
    let s = initialState(0, settings);
    // Manually fill player 0's row 0 with a Blue tile (row 0 capacity 1, color 0).
    const me = s.players[0];
    if (!me) throw new Error("missing player");
    const newPlayer: PlayerBoard = {
      ...me,
      rows: me.rows.map((r, i) => (i === 0 ? [0 as Color] : r.slice())) as PlayerBoard["rows"],
    };
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? newPlayer : p)),
      // Force tiling.
      factories: Array.from({ length: NUM_FACTORIES }, () => [0, 0, 0, 0, 0]),
      center: [0, 0, 0, 0, 0],
      phase: "tiling",
    };
    const after = reducer(s, { type: "advanceTiling" });
    // Wall row 0 col 0 should be filled (blue), score = 1.
    const me2 = after.players[0];
    if (!me2) throw new Error("missing player after");
    expect(me2.wall[0]?.[0]).toBe(true);
    expect(me2.score).toBeGreaterThanOrEqual(1);
    // Round advanced (no full row, so the game shouldn't end yet).
    expect(after.phase === "drafting" || after.phase === "done").toBe(true);
  });

  it("ends the game when a wall row is completed", () => {
    let s = initialState(0, settings);
    const me = s.players[0];
    if (!me) throw new Error("missing player");
    // Pre-fill wall row 0 except column 0; then have pattern row 0 hold the missing color (Blue=0).
    const wall = me.wall.map((r) => r.slice());
    if (wall[0]) {
      wall[0][1] = true;
      wall[0][2] = true;
      wall[0][3] = true;
      wall[0][4] = true;
    }
    const newPlayer: PlayerBoard = {
      ...me,
      wall,
      rows: me.rows.map((r, i) => (i === 0 ? [0 as Color] : r.slice())) as PlayerBoard["rows"],
    };
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? newPlayer : p)),
      factories: Array.from({ length: NUM_FACTORIES }, () => [0, 0, 0, 0, 0]),
      center: [0, 0, 0, 0, 0],
      phase: "tiling",
    };
    const after = reducer(s, { type: "advanceTiling" });
    expect(after.phase).toBe("done");
    const term = isTerminal(after);
    expect(term).not.toBeNull();
    // Score should include the +2 complete-row bonus.
    if (term) expect(term.score).toBeGreaterThanOrEqual(2);
  });
});

describe("azul-full cpuStep", () => {
  it("a CPU on its turn makes a legal pick (board state changes)", () => {
    const s0 = initialState(7, settings);
    // Make it CPU 1's turn.
    const s = { ...s0, active: 1 };
    const after = reducer(s, { type: "cpuStep" });
    expect(after).not.toBe(s);
    // After picking, CPU 1 should have at least one tile somewhere on its board (row or floor).
    const cpu1 = after.players[1];
    if (!cpu1) throw new Error("cpu1 missing");
    const tilesOnRows = cpu1.rows.flat().filter((v) => v !== -1).length;
    const tilesOnFloor = cpu1.floor.filter((t) => t >= 0).length;
    expect(tilesOnRows + tilesOnFloor).toBeGreaterThan(0);
  });

  it("returns same state when it's the human's turn", () => {
    const s = initialState(7, settings);
    const after = reducer(s, { type: "cpuStep" });
    expect(after).toBe(s);
  });
});

describe("azul-full convenience helpers", () => {
  it("legalRowsFor returns all empty rows for any color on a fresh board", () => {
    const s = initialState(0, settings);
    const me = s.players[0];
    if (!me) throw new Error("missing");
    const legal = legalRowsFor(me, 0 as Color);
    expect(legal).toEqual([0, 1, 2, 3, 4]);
  });

  it("totalTilesRemaining is positive at start (factories filled) and 0 after manual zero-out", () => {
    const s = initialState(0, settings);
    expect(totalTilesRemaining(s)).toBeGreaterThan(0);
    const cleared: AzulFullState = {
      ...s,
      factories: s.factories.map(() => [0, 0, 0, 0, 0]),
      center: [0, 0, 0, 0, 0],
    };
    expect(totalTilesRemaining(cleared)).toBe(0);
  });

  it("WALL_PATTERN is a valid 5×5 Latin square (every color exactly once per row and per column)", () => {
    expect(WALL_PATTERN).toHaveLength(WALL_SIZE);
    for (const r of WALL_PATTERN) {
      expect(new Set(r).size).toBe(WALL_SIZE);
    }
    for (let c = 0; c < WALL_SIZE; c++) {
      const col = WALL_PATTERN.map((r) => r[c]);
      expect(new Set(col).size).toBe(WALL_SIZE);
    }
  });
});
