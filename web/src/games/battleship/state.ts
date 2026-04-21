import { Grid } from "../../engines/grid/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Coord } from "../../engines/grid/index.js";

export const GRID_SIZE = 10;

export const SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
] as const;

export type ShipName = typeof SHIPS[number]["name"];

export interface PlacedShip {
  name: ShipName;
  size: number;
  row: number;
  col: number;
  horizontal: boolean;
  hits: number;
}

export type PlayerCellState = "empty" | "ship" | "hit" | "miss";
export type EnemyCellState = "unknown" | "hit" | "miss";

export type GamePhase = "setup" | "playing" | "over";

export interface BattleshipSettings {
  dummy?: string;
}

export interface BattleshipState {
  settings: BattleshipSettings;
  phase: GamePhase;
  // Player grid (visible to player)
  playerGrid: Grid<PlayerCellState>;
  playerShips: PlacedShip[];
  // Enemy grid (player only sees hit/miss)
  enemyGrid: Grid<EnemyCellState>;
  enemyShips: PlacedShip[]; // hidden from player view
  // Setup: which ship player is currently placing
  setupShipIndex: number;
  setupHorizontal: boolean;
  // Hunt-target bot state
  botLastHits: Coord[];
  botTargets: Coord[];
  botSunk: number;
  winner: 0 | 1 | null; // 0 = player, 1 = bot
  rngSeed: number;
}

export type BattleshipAction =
  | { type: "placeShip"; row: number; col: number }
  | { type: "rotateShip" }
  | { type: "autoPlace" }
  | { type: "fire"; row: number; col: number };

function canPlace(grid: Grid<PlayerCellState>, row: number, col: number, size: number, horizontal: boolean): boolean {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (!grid.inBounds({ row: r, col: c })) return false;
    if (grid.get({ row: r, col: c }) !== "empty") return false;
  }
  return true;
}

function placeOnGrid(grid: Grid<PlayerCellState>, row: number, col: number, size: number, horizontal: boolean): Grid<PlayerCellState> {
  let g = grid;
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    g = g.set({ row: r, col: c }, "ship");
  }
  return g;
}

function autoPlaceShips(rng: () => number): { grid: Grid<PlayerCellState>; ships: PlacedShip[] } {
  let grid = Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty");
  const ships: PlacedShip[] = [];

  for (const ship of SHIPS) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = rng() > 0.5;
      const row = Math.floor(rng() * GRID_SIZE);
      const col = Math.floor(rng() * GRID_SIZE);
      if (canPlace(grid, row, col, ship.size, horizontal)) {
        grid = placeOnGrid(grid, row, col, ship.size, horizontal);
        ships.push({ name: ship.name, size: ship.size, row, col, horizontal, hits: 0 });
        placed = true;
      }
    }
  }
  return { grid, ships };
}

export function initialState(seed: number, settings: BattleshipSettings): BattleshipState {
  const rng = mulberry32(seed);
  // Auto-place enemy ships
  const { grid: enemyGrid, ships: enemyShips } = autoPlaceShips(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  // Build enemy cell state grid (all unknown)
  const enemyCellGrid = Grid.filled<EnemyCellState>(GRID_SIZE, GRID_SIZE, "unknown");

  // Build the internal enemy tracking grid
  void enemyGrid; // we keep ship positions in enemyShips

  return {
    settings,
    phase: "setup",
    playerGrid: Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty"),
    playerShips: [],
    enemyGrid: enemyCellGrid,
    enemyShips,
    setupShipIndex: 0,
    setupHorizontal: true,
    botLastHits: [],
    botTargets: [],
    botSunk: 0,
    winner: null,
    rngSeed: nextSeed,
  };
}

function shipCellsSet(ship: PlacedShip): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < ship.size; i++) {
    const r = ship.horizontal ? ship.row : ship.row + i;
    const c = ship.horizontal ? ship.col + i : ship.col;
    s.add(`${r},${c}`);
  }
  return s;
}

function checkSunk(ship: PlacedShip): boolean {
  return ship.hits >= ship.size;
}

function isPlayerDefeated(ships: PlacedShip[]): boolean {
  return ships.every(checkSunk);
}

function isEnemyDefeated(ships: PlacedShip[], grid: Grid<EnemyCellState>): boolean {
  return ships.every((ship) => {
    let hits = 0;
    for (let i = 0; i < ship.size; i++) {
      const r = ship.horizontal ? ship.row : ship.row + i;
      const c = ship.horizontal ? ship.col + i : ship.col;
      if (grid.get({ row: r, col: c }) === "hit") hits++;
    }
    return hits >= ship.size;
  });
}

// Bot: hunt-then-target strategy
function getBotShot(state: BattleshipState): Coord | null {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  void nextSeed;

  // If there are queued targets (adjacent to hits), use them
  if (state.botTargets.length > 0) {
    // Filter already shot
    const valid = state.botTargets.filter((c) => {
      const cell = state.playerGrid.get(c);
      return cell === "empty" || cell === "ship";
    });
    if (valid.length > 0) return valid[0]!;
  }

  // Hunt: random unshot cell
  const unshot: Coord[] = [];
  for (const c of state.playerGrid.coords()) {
    const cell = state.playerGrid.get(c);
    if (cell === "empty" || cell === "ship") unshot.push(c);
  }
  if (unshot.length === 0) return null;
  return unshot[Math.floor(rng() * unshot.length)]!;
}

function addAdjacentTargets(grid: Grid<PlayerCellState>, hit: Coord, existing: Coord[]): Coord[] {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]] as const;
  const existingSet = new Set(existing.map((c) => `${c.row},${c.col}`));
  const newTargets: Coord[] = [];
  for (const [dr, dc] of dirs) {
    const c = { row: hit.row + dr, col: hit.col + dc };
    if (grid.inBounds(c)) {
      const cell = grid.get(c);
      const key = `${c.row},${c.col}`;
      if ((cell === "empty" || cell === "ship") && !existingSet.has(key)) {
        newTargets.push(c);
      }
    }
  }
  return [...existing, ...newTargets];
}

function runBotTurn(state: BattleshipState): BattleshipState {
  const shot = getBotShot(state);
  if (!shot) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const cell = state.playerGrid.get(shot);
  let newPlayerGrid = state.playerGrid;
  let newPlayerShips = state.playerShips;
  let newBotTargets = state.botTargets.filter((c) => !(c.row === shot.row && c.col === shot.col));

  if (cell === "ship") {
    newPlayerGrid = newPlayerGrid.set(shot, "hit");
    // Register hit and add adjacent targets
    newBotTargets = addAdjacentTargets(newPlayerGrid, shot, newBotTargets);
    // Update ship hits
    newPlayerShips = newPlayerShips.map((ship) => {
      const cells = shipCellsSet(ship);
      if (cells.has(`${shot.row},${shot.col}`)) {
        const updated = { ...ship, hits: ship.hits + 1 };
        if (checkSunk(updated)) {
          // Remove targets related to this ship (clear around sunk ship)
          const shipCoords = [...cells];
          newBotTargets = newBotTargets.filter(
            (c) => !shipCoords.some((sc) => {
              const [sr, sc2] = sc.split(",").map(Number);
              const dirs2 = [[-1,0],[1,0],[0,-1],[0,1]] as const;
              return dirs2.some(([dr, dc]) => sr! + dr === c.row && sc2! + dc === c.col);
            })
          );
        }
        return updated;
      }
      return ship;
    });
  } else {
    newPlayerGrid = newPlayerGrid.set(shot, "miss");
  }

  const winner = isPlayerDefeated(newPlayerShips) ? 1 : null;

  return {
    ...state,
    rngSeed: nextSeed,
    playerGrid: newPlayerGrid,
    playerShips: newPlayerShips,
    botTargets: newBotTargets,
    winner,
    phase: winner !== null ? "over" : "playing",
  };
}

export function reducer(state: BattleshipState, action: BattleshipAction): BattleshipState {
  if (action.type === "rotateShip") {
    if (state.phase !== "setup") return state;
    return { ...state, setupHorizontal: !state.setupHorizontal };
  }

  if (action.type === "autoPlace") {
    if (state.phase !== "setup") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { grid, ships } = autoPlaceShips(rng);
    return {
      ...state,
      rngSeed: nextSeed,
      playerGrid: grid,
      playerShips: ships,
      setupShipIndex: SHIPS.length,
      phase: "playing",
    };
  }

  if (action.type === "placeShip") {
    if (state.phase !== "setup") return state;
    if (state.setupShipIndex >= SHIPS.length) return state;
    const ship = SHIPS[state.setupShipIndex]!;
    if (!canPlace(state.playerGrid, action.row, action.col, ship.size, state.setupHorizontal)) return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newGrid = placeOnGrid(state.playerGrid, action.row, action.col, ship.size, state.setupHorizontal);
    const newShips: PlacedShip[] = [
      ...state.playerShips,
      { name: ship.name, size: ship.size, row: action.row, col: action.col, horizontal: state.setupHorizontal, hits: 0 },
    ];
    const nextIdx = state.setupShipIndex + 1;
    const newPhase: GamePhase = nextIdx >= SHIPS.length ? "playing" : "setup";

    return {
      ...state,
      rngSeed: nextSeed,
      playerGrid: newGrid,
      playerShips: newShips,
      setupShipIndex: nextIdx,
      phase: newPhase,
    };
  }

  if (action.type === "fire") {
    if (state.phase !== "playing") return state;
    const target = { row: action.row, col: action.col };
    if (!state.enemyGrid.inBounds(target)) return state;
    if (state.enemyGrid.get(target) !== "unknown") return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    // Check if hit an enemy ship
    let hit = false;
    const newEnemyShips = state.enemyShips.map((ship) => {
      const cells = shipCellsSet(ship);
      if (cells.has(`${action.row},${action.col}`)) {
        hit = true;
        return { ...ship, hits: ship.hits + 1 };
      }
      return ship;
    });

    const newEnemyGrid = state.enemyGrid.set(target, hit ? "hit" : "miss");

    let winner: 0 | 1 | null = null;
    let phase: GamePhase = "playing";
    if (isEnemyDefeated(newEnemyShips, newEnemyGrid)) {
      winner = 0;
      phase = "over";
    }

    let next: BattleshipState = {
      ...state,
      rngSeed: nextSeed,
      enemyGrid: newEnemyGrid,
      enemyShips: newEnemyShips,
      winner,
      phase,
    };

    if (winner === null) {
      next = runBotTurn(next);
    }

    return next;
  }

  return state;
}

export function isTerminal(state: BattleshipState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

export { canPlace, shipCellsSet };
