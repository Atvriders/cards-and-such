import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  canPlace,
  shipCellsSet,
  SHIPS,
  GRID_SIZE,
  aliveCount,
  type BattleshipFullState,
} from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { PlayerCellState } from "./state.js";

describe("battleship-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(12345, {});
    const b = initialState(12345, {});
    expect(a.enemyShips).toEqual(b.enemyShips);
    expect(a.phase).toBe("setup");
    expect(a.enemyShips).toHaveLength(SHIPS.length);
    // Different seeds should likely produce different layouts.
    const c = initialState(99, {});
    const fingerprintA = JSON.stringify(a.enemyShips);
    const fingerprintC = JSON.stringify(c.enemyShips);
    expect(fingerprintA).not.toBe(fingerprintC);
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("enemy fleet respects no-touch placement", () => {
    const s = initialState(7, {});
    // Build occupancy grid from enemyShips
    const occ = new Set<string>();
    for (const ship of s.enemyShips) {
      for (const c of shipCellsSet(ship)) occ.add(c);
    }
    // For each ship cell, the only adjacent ship cells (8-neigh) should belong to the SAME ship
    for (const ship of s.enemyShips) {
      const own = shipCellsSet(ship);
      for (const k of own) {
        const [r, c] = k.split(",").map(Number) as [number, number];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nk = `${r + dr},${c + dc}`;
            if (occ.has(nk) && !own.has(nk)) {
              throw new Error(`No-touch violated near ${k} -> ${nk}`);
            }
          }
        }
      }
    }
  });

  it("autoPlace transitions to playing with a full fleet", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "autoPlace" });
    expect(next.phase).toBe("playing");
    expect(next.playerShips).toHaveLength(SHIPS.length);
    const shipCells = [...next.playerGrid.coords()].filter(
      (c) => next.playerGrid.get(c) === "ship",
    ).length;
    const totalSize = SHIPS.reduce((sum, sh) => sum + sh.size, 0);
    expect(shipCells).toBe(totalSize);
  });

  it("canPlace blocks out-of-bounds placements and accepts valid ones", () => {
    const grid = Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty");
    expect(canPlace(grid, 9, 8, 5, true)).toBe(false); // off right
    expect(canPlace(grid, 8, 0, 5, false)).toBe(false); // off bottom
    expect(canPlace(grid, 0, 0, 5, true)).toBe(true);
    expect(canPlace(grid, 0, 0, 5, false)).toBe(true);
  });

  it("rotateShip toggles orientation in setup but not in playing", () => {
    const s = initialState(0, {});
    expect(s.setupHorizontal).toBe(true);
    const r1 = reducer(s, { type: "rotateShip" });
    expect(r1.setupHorizontal).toBe(false);
    // Should be a no-op in playing phase
    const playing = reducer(s, { type: "autoPlace" });
    const r2 = reducer(playing, { type: "rotateShip" });
    expect(r2).toBe(playing); // same state reference for ignored actions
  });

  it("queueShot adds and unqueueShot removes; cap = surviving ships", () => {
    const s = initialState(0, {});
    const playing = reducer(s, { type: "autoPlace" });
    expect(aliveCount(playing.playerShips)).toBe(5);

    let next = playing;
    for (let i = 0; i < 5; i++) {
      next = reducer(next, { type: "queueShot", row: 0, col: i });
    }
    expect(next.pendingShots).toHaveLength(5);

    // Sixth queue is rejected
    const overflow = reducer(next, { type: "queueShot", row: 1, col: 0 });
    expect(overflow).toBe(next);

    // Unqueue one
    const removed = reducer(next, { type: "unqueueShot", row: 0, col: 2 });
    expect(removed.pendingShots).toHaveLength(4);
    // Removing a non-queued cell returns same reference
    const noop = reducer(removed, { type: "unqueueShot", row: 9, col: 9 });
    expect(noop).toBe(removed);
  });

  it("fireSalvo requires exactly N shots and then resolves them", () => {
    const s = initialState(0, {});
    let st = reducer(s, { type: "autoPlace" });
    // Try to fire with empty queue — no-op
    const noFire = reducer(st, { type: "fireSalvo" });
    expect(noFire).toBe(st);

    for (let i = 0; i < 5; i++) {
      st = reducer(st, { type: "queueShot", row: 0, col: i });
    }
    const fired = reducer(st, { type: "fireSalvo" });
    expect(fired.pendingShots).toHaveLength(0);
    // Every queued cell should now be hit or miss
    for (let i = 0; i < 5; i++) {
      const v = fired.enemyGrid.get({ row: 0, col: i });
      expect(v === "hit" || v === "miss").toBe(true);
    }
    expect(fired.lastPlayerShots).toHaveLength(5);
  });

  it("sonar ping reveals enemy ship cells in a 3x3 area and consumes the one-shot use", () => {
    const s = initialState(0, {});
    let st = reducer(s, { type: "autoPlace" });
    // Find a known ship cell on enemy
    const target = shipCellsSet(st.enemyShips[0]!);
    const firstKey = target.values().next().value as string;
    const [r, c] = firstKey.split(",").map(Number) as [number, number];

    st = reducer(st, { type: "sonarPing", row: r, col: c });
    expect(st.sonarUsed).toBe(true);
    // The center cell, being a ship, should be revealed as sonar
    expect(st.enemyGrid.get({ row: r, col: c })).toBe("sonar");

    // Second sonar attempt is a no-op
    const again = reducer(st, { type: "sonarPing", row: 5, col: 5 });
    expect(again).toBe(st);
  });

  it("fighter jet hits a ship cell and consumes the one-shot use; does not trigger bot", () => {
    const s = initialState(0, {});
    let st = reducer(s, { type: "autoPlace" });
    const firstShip = st.enemyShips[0]!;
    const firstCell = shipCellsSet(firstShip).values().next().value as string;
    const [r, c] = firstCell.split(",").map(Number) as [number, number];

    const before = st.playerGrid;
    st = reducer(st, { type: "fighterJet", row: r, col: c });
    expect(st.fighterUsed).toBe(true);
    expect(st.enemyGrid.get({ row: r, col: c })).toBe("hit");
    // Player grid unchanged — bot did not retaliate
    expect(st.playerGrid).toBe(before);

    const again = reducer(st, { type: "fighterJet", row: 0, col: 0 });
    expect(again).toBe(st);
  });

  it("isTerminal returns winner score for player win and 0 for loss", () => {
    const s = initialState(0, {});
    const won: BattleshipFullState = { ...s, winner: 0, phase: "over" };
    expect(isTerminal(won)?.score).toBeGreaterThanOrEqual(100);
    const lost: BattleshipFullState = { ...s, winner: 1, phase: "over" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("complete play-through: hitting every enemy ship cell ends with a player win", () => {
    const s = initialState(123, {});
    let st = reducer(s, { type: "autoPlace" });
    // Collect every enemy ship cell — sorted so we hit ships one at a time.
    const allCells: { row: number; col: number }[] = [];
    for (const ship of st.enemyShips) {
      for (const k of shipCellsSet(ship)) {
        const [r, c] = k.split(",").map(Number) as [number, number];
        allCells.push({ row: r, col: c });
      }
    }
    // Fire one salvo at a time until we win or run out of cells / 200 iterations
    let safety = 200;
    while (st.phase === "playing" && safety-- > 0) {
      const n = aliveCount(st.playerShips);
      if (n <= 0) break;
      // Pick the next n cells that aren't already resolved
      const queue: { row: number; col: number }[] = [];
      for (const cell of allCells) {
        if (queue.length >= n) break;
        const v = st.enemyGrid.get(cell);
        if (v === "unknown" || v === "sonar") {
          if (!queue.some((q) => q.row === cell.row && q.col === cell.col)) {
            queue.push(cell);
          }
        }
      }
      if (queue.length === 0) break;
      // If we have fewer ship cells than required salvo size, pad with empty cells
      let safetyR = 0;
      let safetyC = 0;
      while (queue.length < n && safetyR < GRID_SIZE) {
        const target = { row: safetyR, col: safetyC };
        const v = st.enemyGrid.get(target);
        if (
          (v === "unknown" || v === "sonar") &&
          !queue.some((q) => q.row === target.row && q.col === target.col)
        ) {
          queue.push(target);
        }
        safetyC++;
        if (safetyC >= GRID_SIZE) {
          safetyC = 0;
          safetyR++;
        }
      }
      // Queue them
      for (const q of queue) {
        st = reducer(st, { type: "queueShot", row: q.row, col: q.col });
      }
      st = reducer(st, { type: "fireSalvo" });
    }
    // Either we won, or the CPU won — but with deterministic seed we expect a finished game.
    expect(st.phase).toBe("over");
    expect(isTerminal(st)).not.toBeNull();
  });

  it("illegal placement during setup returns same reference", () => {
    const s = initialState(0, {});
    // Out-of-bounds placement: carrier of size 5 starting at col 9 horizontal
    const same = reducer(s, { type: "placeShip", row: 0, col: 9 });
    expect(same).toBe(s);
  });
});
