import { Grid } from "../../engines/grid/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Coord } from "../../engines/grid/index.js";

/* ---------------------------------------------------------------------------
 * Battleship — Full Salvo + Advanced edition
 * ---------------------------------------------------------------------------
 *
 * Differences from the base `battleship` game:
 *   1. SALVO mode — every turn the player (and the CPU) fires one shot for
 *      EACH of their surviving ships, so a full fleet shoots 5 shots, a
 *      crippled fleet shoots fewer. Shots are queued client-side and then
 *      resolved together via the `fireSalvo` action.
 *   2. SONAR PING (1 use per game) — reveals every enemy ship cell inside a
 *      3×3 area centered on the chosen square. Does NOT count as a shot.
 *   3. FIGHTER JET (1 use per game) — a single wildcard shot that costs no
 *      salvo slot; resolved immediately and never returns "miss" feedback —
 *      it always reports back whether it found a ship cell.
 *   4. NO-TOUCH placement — the CPU places ships such that no two ships are
 *      orthogonally OR diagonally adjacent. The player is unrestricted (so
 *      they can still hug ships together if they want).
 *
 * CPU AI — parity-search-then-target hunting strategy
 * ---------------------------------------------------
 * Canonical Battleship strategy. The CPU runs in one of two modes:
 *
 *   HUNT mode — no live "leaked" hits to follow up on. The CPU shoots at
 *   cells matching a parity filter: only cells where (row + col) % 2 === 0
 *   are eligible. The smallest live enemy ship has length 2, so every ship
 *   MUST overlap at least one parity cell — searching only parity cells
 *   halves the search space without missing any ship. Among eligible cells
 *   the CPU prefers the centre of the board (where ships are more likely
 *   to overlap, by Battleship probability density studies). If parity is
 *   exhausted, the CPU falls back to any unshot cell.
 *
 *   TARGET mode — triggered the moment any shot hits a ship that is not
 *   yet sunk. The CPU pushes the four orthogonal neighbours of the hit
 *   onto a `botTargets` queue. When two collinear hits exist (e.g. (3,4)
 *   and (3,5)), the queue is filtered to keep extending in that line —
 *   this is the "lock-on after two hits" optimisation. When a ship is
 *   sunk, surrounding cells are cleared (they can't be ship by the
 *   no-touch rule — actually the player's fleet has no such restriction
 *   so we only clear cells that can't possibly hold a remaining ship by
 *   pure geometry, i.e. the diagonals which are never connected anyway).
 *
 * The CPU also fires in salvo: it fires `numAlive` shots in one go, drawn
 * from target/hunt sources, then resolves them all against the player.
 * ------------------------------------------------------------------------- */

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
export type EnemyCellState = "unknown" | "hit" | "miss" | "sonar"; // sonar = revealed-but-unfired

export type GamePhase = "setup" | "playing" | "over";

export interface BattleshipFullSettings {
  _dummy?: string;
}

export interface BattleshipFullState {
  settings: BattleshipFullSettings;
  phase: GamePhase;
  // Player grid (visible to player)
  playerGrid: Grid<PlayerCellState>;
  playerShips: PlacedShip[];
  // Enemy grid (player only sees hit/miss/sonar)
  enemyGrid: Grid<EnemyCellState>;
  enemyShips: PlacedShip[]; // hidden from player view
  // Setup
  setupShipIndex: number;
  setupHorizontal: boolean;
  // Salvo: shots queued for the current player turn
  pendingShots: Coord[];
  // Special abilities — once used, never again this game
  sonarUsed: boolean;
  fighterUsed: boolean;
  // Last-salvo log for the message area
  lastPlayerShots: { coord: Coord; hit: boolean; sunk: ShipName | null }[];
  lastBotShots: { coord: Coord; hit: boolean; sunk: ShipName | null }[];
  // Bot AI state
  botTargets: Coord[]; // queue of cells to probe after a hit
  botHitChain: Coord[]; // current unsunk-hit chain (used to "lock onto" line)
  // Game outcome
  winner: 0 | 1 | null; // 0 = player, 1 = bot
  rngSeed: number;
}

export type BattleshipFullAction =
  | { type: "placeShip"; row: number; col: number }
  | { type: "rotateShip" }
  | { type: "autoPlace" }
  | { type: "queueShot"; row: number; col: number }
  | { type: "unqueueShot"; row: number; col: number }
  | { type: "clearShots" }
  | { type: "fireSalvo" }
  | { type: "sonarPing"; row: number; col: number }
  | { type: "fighterJet"; row: number; col: number };

// ===========================================================================
// Placement helpers
// ===========================================================================

export function canPlace(
  grid: Grid<PlayerCellState>,
  row: number,
  col: number,
  size: number,
  horizontal: boolean,
): boolean {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (!grid.inBounds({ row: r, col: c })) return false;
    if (grid.get({ row: r, col: c }) !== "empty") return false;
  }
  return true;
}

/** No-touch placement (used only for CPU): the new ship cannot be orthogonally
 *  OR diagonally adjacent to any existing ship cell. */
function canPlaceNoTouch(
  grid: Grid<PlayerCellState>,
  row: number,
  col: number,
  size: number,
  horizontal: boolean,
): boolean {
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (!grid.inBounds({ row: r, col: c })) return false;
    if (grid.get({ row: r, col: c }) !== "empty") return false;
    // Check all 8 neighbours for adjacency
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
        if (grid.get({ row: nr, col: nc }) === "ship") return false;
      }
    }
  }
  return true;
}

function placeOnGrid(
  grid: Grid<PlayerCellState>,
  row: number,
  col: number,
  size: number,
  horizontal: boolean,
): Grid<PlayerCellState> {
  let g = grid;
  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    g = g.set({ row: r, col: c }, "ship");
  }
  return g;
}

/** Random placement using NO-TOUCH rule — used for CPU and the player's
 *  auto-place button. */
function autoPlaceShipsNoTouch(
  rng: () => number,
): { grid: Grid<PlayerCellState>; ships: PlacedShip[] } {
  let grid = Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty");
  const ships: PlacedShip[] = [];

  for (const ship of SHIPS) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 5000) {
      attempts++;
      const horizontal = rng() > 0.5;
      const row = Math.floor(rng() * GRID_SIZE);
      const col = Math.floor(rng() * GRID_SIZE);
      if (canPlaceNoTouch(grid, row, col, ship.size, horizontal)) {
        grid = placeOnGrid(grid, row, col, ship.size, horizontal);
        ships.push({
          name: ship.name,
          size: ship.size,
          row,
          col,
          horizontal,
          hits: 0,
        });
        placed = true;
      }
    }
    if (!placed) {
      // Pathological RNG — fall back to loose placement so we always finish.
      // (Should be statistically near-impossible on a 10x10 board.)
      while (!placed) {
        const horizontal = rng() > 0.5;
        const row = Math.floor(rng() * GRID_SIZE);
        const col = Math.floor(rng() * GRID_SIZE);
        if (canPlace(grid, row, col, ship.size, horizontal)) {
          grid = placeOnGrid(grid, row, col, ship.size, horizontal);
          ships.push({
            name: ship.name,
            size: ship.size,
            row,
            col,
            horizontal,
            hits: 0,
          });
          placed = true;
        }
      }
    }
  }
  return { grid, ships };
}

export function initialState(
  seed: number,
  settings: BattleshipFullSettings,
): BattleshipFullState {
  const rng = mulberry32(seed);
  const { ships: enemyShips } = autoPlaceShipsNoTouch(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    settings,
    phase: "setup",
    playerGrid: Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty"),
    playerShips: [],
    enemyGrid: Grid.filled<EnemyCellState>(GRID_SIZE, GRID_SIZE, "unknown"),
    enemyShips,
    setupShipIndex: 0,
    setupHorizontal: true,
    pendingShots: [],
    sonarUsed: false,
    fighterUsed: false,
    lastPlayerShots: [],
    lastBotShots: [],
    botTargets: [],
    botHitChain: [],
    winner: null,
    rngSeed: nextSeed,
  };
}

// ===========================================================================
// Ship state helpers
// ===========================================================================

function shipCells(ship: PlacedShip): Coord[] {
  const out: Coord[] = [];
  for (let i = 0; i < ship.size; i++) {
    const r = ship.horizontal ? ship.row : ship.row + i;
    const c = ship.horizontal ? ship.col + i : ship.col;
    out.push({ row: r, col: c });
  }
  return out;
}

export function shipCellsSet(ship: PlacedShip): Set<string> {
  const s = new Set<string>();
  for (const c of shipCells(ship)) s.add(`${c.row},${c.col}`);
  return s;
}

function isShipSunk(ship: PlacedShip): boolean {
  return ship.hits >= ship.size;
}

function aliveCount(ships: PlacedShip[]): number {
  return ships.filter((s) => !isShipSunk(s)).length;
}

function allSunk(ships: PlacedShip[]): boolean {
  return ships.every(isShipSunk);
}

function isEnemyDefeatedByGrid(
  ships: PlacedShip[],
  grid: Grid<EnemyCellState>,
): boolean {
  return ships.every((ship) => {
    let hits = 0;
    for (const c of shipCells(ship)) {
      if (grid.get(c) === "hit") hits++;
    }
    return hits >= ship.size;
  });
}

// ===========================================================================
// CPU AI
// ===========================================================================

interface BotShotResult {
  coord: Coord;
  remainingTargets: Coord[];
}

/** Pick `n` shots for the bot. Salvo: returns up to n distinct coords. */
function pickBotShots(state: BattleshipFullState, n: number, rngSeed: number): { shots: Coord[]; nextSeed: number; remainingTargets: Coord[] } {
  const rng = mulberry32(rngSeed);
  const shots: Coord[] = [];
  let targets = [...state.botTargets];
  const shotSet = new Set<string>();
  const isShot = (c: Coord) => {
    const cell = state.playerGrid.get(c);
    return cell === "hit" || cell === "miss";
  };

  for (let i = 0; i < n; i++) {
    const result = pickOneBotShot(state, targets, rng, shotSet, isShot);
    if (!result) break;
    shots.push(result.coord);
    shotSet.add(`${result.coord.row},${result.coord.col}`);
    targets = result.remainingTargets;
  }

  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { shots, nextSeed, remainingTargets: targets };
}

function pickOneBotShot(
  state: BattleshipFullState,
  targets: Coord[],
  rng: () => number,
  alreadyPickedThisSalvo: Set<string>,
  isShot: (c: Coord) => boolean,
): BotShotResult | null {
  const taken = (c: Coord) => isShot(c) || alreadyPickedThisSalvo.has(`${c.row},${c.col}`);

  // TARGET mode — drain the target queue first
  let workingTargets = targets.filter((c) => !taken(c));
  if (workingTargets.length > 0) {
    // Prefer "extending the line" if two consecutive hits exist along a target's axis
    const lineExt = preferLineExtension(state, workingTargets);
    const pick = lineExt ?? workingTargets[0]!;
    return {
      coord: pick,
      remainingTargets: workingTargets.filter(
        (c) => !(c.row === pick.row && c.col === pick.col),
      ),
    };
  }

  // HUNT mode — parity search prioritising centre cells
  const parityCells: Coord[] = [];
  const nonParityCells: Coord[] = [];
  for (const c of state.playerGrid.coords()) {
    if (taken(c)) continue;
    if ((c.row + c.col) % 2 === 0) parityCells.push(c);
    else nonParityCells.push(c);
  }
  const pool = parityCells.length > 0 ? parityCells : nonParityCells;
  if (pool.length === 0) return null;

  // Weight: prefer cells closer to centre, so split into "centre" half and pick from there.
  const distance = (c: Coord) =>
    Math.abs(c.row - (GRID_SIZE - 1) / 2) + Math.abs(c.col - (GRID_SIZE - 1) / 2);
  pool.sort((a, b) => distance(a) - distance(b));
  // Pick uniformly from the centre half (better expected hit rate); fall back to any.
  const top = pool.slice(0, Math.max(1, Math.ceil(pool.length / 2)));
  const choice = top[Math.floor(rng() * top.length)]!;
  return { coord: choice, remainingTargets: targets };
}

/** If `botHitChain` shows ≥2 collinear hits, prefer targets that extend the line. */
function preferLineExtension(state: BattleshipFullState, targets: Coord[]): Coord | null {
  const chain = state.botHitChain;
  if (chain.length < 2) return null;
  // Determine axis
  const sameRow = chain.every((c) => c.row === chain[0]!.row);
  const sameCol = chain.every((c) => c.col === chain[0]!.col);
  if (sameRow) {
    // Find leftmost/rightmost cols
    const cols = chain.map((c) => c.col);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    const row = chain[0]!.row;
    const ext = targets.find(
      (t) => t.row === row && (t.col === minC - 1 || t.col === maxC + 1),
    );
    return ext ?? null;
  }
  if (sameCol) {
    const rows = chain.map((c) => c.row);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const col = chain[0]!.col;
    const ext = targets.find(
      (t) => t.col === col && (t.row === minR - 1 || t.row === maxR + 1),
    );
    return ext ?? null;
  }
  return null;
}

/** Add the 4 orthogonal neighbours of a hit to the bot's target queue. */
function pushAdjacentTargets(
  grid: Grid<PlayerCellState>,
  hit: Coord,
  existing: Coord[],
): Coord[] {
  const existingSet = new Set(existing.map((c) => `${c.row},${c.col}`));
  const out = [...existing];
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const) {
    const c = { row: hit.row + dr, col: hit.col + dc };
    if (!grid.inBounds(c)) continue;
    const cell = grid.get(c);
    if (cell === "hit" || cell === "miss") continue;
    const key = `${c.row},${c.col}`;
    if (!existingSet.has(key)) {
      out.push(c);
      existingSet.add(key);
    }
  }
  return out;
}

function runBotSalvo(state: BattleshipFullState): BattleshipFullState {
  const n = aliveCount(state.playerShips);
  if (n <= 0) return state;
  const { shots, nextSeed } = pickBotShots(state, n, state.rngSeed);

  let playerGrid = state.playerGrid;
  let playerShips = state.playerShips.map((s) => ({ ...s }));
  let targets = [...state.botTargets];
  let chain = [...state.botHitChain];
  const log: { coord: Coord; hit: boolean; sunk: ShipName | null }[] = [];

  for (const shot of shots) {
    const cell = playerGrid.get(shot);
    if (cell === "hit" || cell === "miss") {
      log.push({ coord: shot, hit: false, sunk: null });
      continue;
    }
    if (cell === "ship") {
      playerGrid = playerGrid.set(shot, "hit");
      // Update ship hits
      let sunkName: ShipName | null = null;
      playerShips = playerShips.map((ship) => {
        if (shipCellsSet(ship).has(`${shot.row},${shot.col}`)) {
          const upd = { ...ship, hits: ship.hits + 1 };
          if (isShipSunk(upd) && !isShipSunk(ship)) sunkName = upd.name;
          return upd;
        }
        return ship;
      });
      // Remove this shot from target queue if present
      targets = targets.filter(
        (c) => !(c.row === shot.row && c.col === shot.col),
      );
      // Add new neighbours to target queue
      targets = pushAdjacentTargets(playerGrid, shot, targets);
      chain.push(shot);
      log.push({ coord: shot, hit: true, sunk: sunkName });
      // If sunk, clear the chain and prune targets that lie on this sunk ship's footprint
      if (sunkName) {
        const sunkShip = playerShips.find((s) => s.name === sunkName);
        if (sunkShip) {
          const sunkSet = shipCellsSet(sunkShip);
          // Reset chain to any unsunk hits
          chain = chain.filter((c) => !sunkSet.has(`${c.row},${c.col}`));
          // Prune targets adjacent only to this sunk ship's cells
          targets = targets.filter((t) => {
            // Keep a target if it's still adjacent to some hit that is NOT part of a sunk ship
            return chain.some(
              (h) => Math.abs(h.row - t.row) + Math.abs(h.col - t.col) === 1,
            );
          });
        }
      }
    } else {
      // empty -> miss
      playerGrid = playerGrid.set(shot, "miss");
      targets = targets.filter(
        (c) => !(c.row === shot.row && c.col === shot.col),
      );
      log.push({ coord: shot, hit: false, sunk: null });
    }
    if (allSunk(playerShips)) break;
  }

  const winner: 0 | 1 | null = allSunk(playerShips) ? 1 : null;
  return {
    ...state,
    rngSeed: nextSeed,
    playerGrid,
    playerShips,
    botTargets: targets,
    botHitChain: chain,
    lastBotShots: log,
    winner,
    phase: winner !== null ? "over" : "playing",
  };
}

// ===========================================================================
// Reducer
// ===========================================================================

export function reducer(
  state: BattleshipFullState,
  action: BattleshipFullAction,
): BattleshipFullState {
  // ---- Setup actions ----
  if (action.type === "rotateShip") {
    if (state.phase !== "setup") return state;
    return { ...state, setupHorizontal: !state.setupHorizontal };
  }

  if (action.type === "autoPlace") {
    if (state.phase !== "setup") return state;
    const rng = mulberry32(state.rngSeed);
    const { grid, ships } = autoPlaceShipsNoTouch(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
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
    if (!canPlace(state.playerGrid, action.row, action.col, ship.size, state.setupHorizontal))
      return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newGrid = placeOnGrid(
      state.playerGrid,
      action.row,
      action.col,
      ship.size,
      state.setupHorizontal,
    );
    const newShips: PlacedShip[] = [
      ...state.playerShips,
      {
        name: ship.name,
        size: ship.size,
        row: action.row,
        col: action.col,
        horizontal: state.setupHorizontal,
        hits: 0,
      },
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

  // ---- Playing actions ----
  if (action.type === "queueShot") {
    if (state.phase !== "playing") return state;
    const target = { row: action.row, col: action.col };
    if (!state.enemyGrid.inBounds(target)) return state;
    const cell = state.enemyGrid.get(target);
    if (cell !== "unknown" && cell !== "sonar") return state;
    // Already queued?
    if (state.pendingShots.some((c) => c.row === target.row && c.col === target.col))
      return state;
    const maxShots = aliveCount(state.playerShips);
    if (state.pendingShots.length >= maxShots) return state;
    return { ...state, pendingShots: [...state.pendingShots, target] };
  }

  if (action.type === "unqueueShot") {
    if (state.phase !== "playing") return state;
    const next = state.pendingShots.filter(
      (c) => !(c.row === action.row && c.col === action.col),
    );
    if (next.length === state.pendingShots.length) return state;
    return { ...state, pendingShots: next };
  }

  if (action.type === "clearShots") {
    if (state.phase !== "playing") return state;
    if (state.pendingShots.length === 0) return state;
    return { ...state, pendingShots: [] };
  }

  if (action.type === "fireSalvo") {
    if (state.phase !== "playing") return state;
    if (state.pendingShots.length === 0) return state;
    const maxShots = aliveCount(state.playerShips);
    if (state.pendingShots.length !== maxShots) return state;

    let enemyGrid = state.enemyGrid;
    let enemyShips = state.enemyShips.map((s) => ({ ...s }));
    const log: { coord: Coord; hit: boolean; sunk: ShipName | null }[] = [];

    for (const shot of state.pendingShots) {
      let isHit = false;
      let sunkName: ShipName | null = null;
      enemyShips = enemyShips.map((ship) => {
        if (shipCellsSet(ship).has(`${shot.row},${shot.col}`)) {
          isHit = true;
          const upd = { ...ship, hits: ship.hits + 1 };
          if (isShipSunk(upd) && !isShipSunk(ship)) sunkName = upd.name;
          return upd;
        }
        return ship;
      });
      enemyGrid = enemyGrid.set(shot, isHit ? "hit" : "miss");
      log.push({ coord: shot, hit: isHit, sunk: sunkName });
    }

    const enemyDefeated = isEnemyDefeatedByGrid(enemyShips, enemyGrid);
    let next: BattleshipFullState = {
      ...state,
      enemyGrid,
      enemyShips,
      pendingShots: [],
      lastPlayerShots: log,
      lastBotShots: [],
      winner: enemyDefeated ? 0 : null,
      phase: enemyDefeated ? "over" : "playing",
    };

    if (!enemyDefeated) {
      next = runBotSalvo(next);
    }
    return next;
  }

  if (action.type === "sonarPing") {
    if (state.phase !== "playing") return state;
    if (state.sonarUsed) return state;
    const center = { row: action.row, col: action.col };
    if (!state.enemyGrid.inBounds(center)) return state;
    let grid = state.enemyGrid;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const c = { row: center.row + dr, col: center.col + dc };
        if (!grid.inBounds(c)) continue;
        if (grid.get(c) !== "unknown") continue;
        // Reveal ship presence
        const hasShip = state.enemyShips.some((ship) =>
          shipCellsSet(ship).has(`${c.row},${c.col}`),
        );
        if (hasShip) {
          grid = grid.set(c, "sonar");
        }
      }
    }
    return { ...state, enemyGrid: grid, sonarUsed: true };
  }

  if (action.type === "fighterJet") {
    if (state.phase !== "playing") return state;
    if (state.fighterUsed) return state;
    const target = { row: action.row, col: action.col };
    if (!state.enemyGrid.inBounds(target)) return state;
    const cell = state.enemyGrid.get(target);
    if (cell !== "unknown" && cell !== "sonar") return state;

    let enemyGrid = state.enemyGrid;
    let enemyShips = state.enemyShips.map((s) => ({ ...s }));
    let isHit = false;
    let sunkName: ShipName | null = null;
    enemyShips = enemyShips.map((ship) => {
      if (shipCellsSet(ship).has(`${target.row},${target.col}`)) {
        isHit = true;
        const upd = { ...ship, hits: ship.hits + 1 };
        if (isShipSunk(upd) && !isShipSunk(ship)) sunkName = upd.name;
        return upd;
      }
      return ship;
    });
    enemyGrid = enemyGrid.set(target, isHit ? "hit" : "miss");

    const enemyDefeated = isEnemyDefeatedByGrid(enemyShips, enemyGrid);
    let next: BattleshipFullState = {
      ...state,
      enemyGrid,
      enemyShips,
      fighterUsed: true,
      lastPlayerShots: [{ coord: target, hit: isHit, sunk: sunkName }],
      lastBotShots: [],
      winner: enemyDefeated ? 0 : null,
      phase: enemyDefeated ? "over" : "playing",
    };

    if (!enemyDefeated) {
      // Fighter jet does NOT trigger a bot turn — it's a free wildcard.
      // Bot still only acts in response to the salvo. Keep state as-is.
    }
    return next;
  }

  return state;
}

export function isTerminal(state: BattleshipFullState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) {
    // Score = 100 base + bonus for surviving ships + bonus for unused abilities
    const aliveBonus = aliveCount(state.playerShips) * 20;
    const sonarBonus = state.sonarUsed ? 0 : 10;
    const fighterBonus = state.fighterUsed ? 0 : 10;
    return { score: 100 + aliveBonus + sonarBonus + fighterBonus };
  }
  return { score: 0 };
}

// Re-exports for tests / UI
export { aliveCount, allSunk };
