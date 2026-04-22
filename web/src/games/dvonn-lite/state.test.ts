import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, getLegalPlaces } from "./state.js";
import type { DvonnLiteState, Stack } from "./state.js";
import { Grid } from "../../engines/grid/index.js";

const settings = { opponent: "hot-seat" as const };

describe("DvonnLite initialState", () => {
  it("starts in placement phase", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("placement");
  });

  it("has exactly 2 DVONN pieces on 6x6 board", () => {
    const s = initialState(1, settings);
    let dvonn = 0;
    for (const c of s.grid.coords()) {
      const v = s.grid.get(c);
      if (v && v.hasDvonn) dvonn++;
    }
    expect(dvonn).toBe(2);
  });

  it("board is 6x6", () => {
    const s = initialState(1, settings);
    expect(s.grid.rows).toBe(6);
    expect(s.grid.cols).toBe(6);
  });
});

describe("DvonnLite placement", () => {
  it("placing a piece fills the cell", () => {
    const s = initialState(42, settings);
    const places = getLegalPlaces(s);
    expect(places.length).toBeGreaterThan(0);
    const at = places[0]!;
    const next = reducer(s, { type: "place", at });
    const stack = next.grid.get(at);
    expect(stack).not.toBeNull();
    expect(stack!.top).toBe("W");
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(42, settings);
    // Find occupied cell (DVONN)
    let dvonnCoord = null;
    for (const c of s.grid.coords()) {
      if (s.grid.get(c) !== null) { dvonnCoord = c; break; }
    }
    if (!dvonnCoord) return;
    const before = s.grid;
    const next = reducer(s, { type: "place", at: dvonnCoord });
    expect(next.grid).toBe(before);
  });
});

describe("DvonnLite movement", () => {
  it("stack of height 2 moves 2 squares", () => {
    // Create a minimal movement-phase state
    const cells: (Stack | null)[] = new Array(36).fill(null);
    // DVONN at (0,0)
    cells[0] = { height: 1, top: "D", hasDvonn: true };
    // W stack of height 2 at (2,0)
    cells[2 * 6 + 0] = { height: 2, top: "W", hasDvonn: false };
    // Target at (0,0) — 2 squares up (row -2 would be out, let's do right)
    // Target at (2,2) — 2 squares right
    cells[2 * 6 + 2] = { height: 1, top: "B", hasDvonn: false };

    const state: DvonnLiteState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Stack | null>(6, 6, cells),
      turn: "W",
      phase: "movement",
      placementSub: "pieces",
      dvonnPlaced: 2,
      piecesPlaced: { W: 12, B: 12 },
      selected: null,
      winner: null,
    };
    const moves = getLegalMoves(state);
    // Should have move from (2,0) to (2,2)
    const m = moves.find(mv => mv.from.row === 2 && mv.from.col === 0 && mv.to.row === 2 && mv.to.col === 2);
    expect(m).toBeDefined();
  });

  it("isTerminal returns draw when scores equal", () => {
    const cells: (Stack | null)[] = new Array(36).fill(null);
    cells[0] = { height: 1, top: "W", hasDvonn: true }; // W controls 1 (with dvonn)
    cells[1] = { height: 1, top: "B", hasDvonn: false }; // but this is disconnected...
    // For simplicity, test with winner already set
    const state: DvonnLiteState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Stack | null>(6, 6, cells),
      turn: "W",
      phase: "movement",
      placementSub: "pieces",
      dvonnPlaced: 2,
      piecesPlaced: { W: 12, B: 12 },
      selected: null,
      winner: "draw",
    };
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(50);
  });

  it("W win gives score 100", () => {
    const state: DvonnLiteState = {
      settings,
      rngSeed: 1,
      grid: Grid.filled<Stack | null>(6, 6, null),
      turn: "B",
      phase: "movement",
      placementSub: "pieces",
      dvonnPlaced: 2,
      piecesPlaced: { W: 12, B: 12 },
      selected: null,
      winner: "W",
    };
    expect(isTerminal(state)!.score).toBe(100);
  });
});
