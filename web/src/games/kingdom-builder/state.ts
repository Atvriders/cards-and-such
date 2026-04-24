import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_SIZE = 5; // 5x5 grid
export const TOTAL_TILES = 15; // tiles to place

export type TileType = "castle" | "farm" | "forest" | "mine" | "village" | "empty";

export interface Cell {
  tile: TileType;
}

export interface KingdomBuilderState {
  rngSeed: number;
  tilesPlaced: number;
  grid: readonly Cell[];
  hand: readonly TileType[];
  score: number;
  phase: "place" | "done";
  lastScoreGain: number;
}

export type KingdomBuilderAction =
  | { type: "placeTile"; cellIndex: number; tile: TileType }
  | { type: "discardAndDraw" };

const TILE_VALUES: Record<TileType, number> = {
  castle: 10, farm: 4, forest: 3, mine: 6, village: 5, empty: 0,
};

export { TILE_VALUES };

const TILE_POOL: TileType[] = [
  "castle","castle","farm","farm","farm","farm","farm",
  "forest","forest","forest","mine","mine","mine","village","village","village","village",
];

export const TILE_EMOJI: Record<TileType, string> = {
  castle: "🏰", farm: "🌾", forest: "🌲", mine: "⛏️", village: "🏘️", empty: "·",
};

export const TILE_LABELS: Record<TileType, string> = {
  castle: "Castle", farm: "Farm", forest: "Forest", mine: "Mine", village: "Village", empty: "Empty",
};

function shuffleTiles(pool: TileType[], rng: () => number): TileType[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function adjacentIndices(idx: number): number[] {
  const row = Math.floor(idx / GRID_SIZE);
  const col = idx % GRID_SIZE;
  const adj: number[] = [];
  if (row > 0) adj.push(idx - GRID_SIZE);
  if (row < GRID_SIZE - 1) adj.push(idx + GRID_SIZE);
  if (col > 0) adj.push(idx - 1);
  if (col < GRID_SIZE - 1) adj.push(idx + 1);
  return adj;
}

function computeScore(grid: readonly Cell[]): number {
  let score = 0;
  for (let i = 0; i < grid.length; i++) {
    const tile = grid[i]!.tile;
    if (tile === "empty") continue;
    score += TILE_VALUES[tile];

    // Bonus: adjacent tiles of same type
    const adj = adjacentIndices(i);
    for (const ai of adj) {
      if (grid[ai]?.tile === tile) score += 2;
    }

    // Castle bonus: adjacent villages
    if (tile === "castle") {
      for (const ai of adj) {
        if (grid[ai]?.tile === "village") score += 4;
      }
    }

    // Mine bonus: adjacent forests
    if (tile === "mine") {
      for (const ai of adj) {
        if (grid[ai]?.tile === "forest") score += 3;
      }
    }
  }
  return score;
}

export function initialState(seed: number): KingdomBuilderState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const shuffled = shuffleTiles(TILE_POOL, rng2);
  const hand = shuffled.slice(0, 3) as TileType[];
  const remaining = shuffled.slice(3);
  const grid: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({ tile: "empty" as TileType }));
  return {
    rngSeed: nextSeed,
    tilesPlaced: 0,
    grid,
    hand,
    score: 0,
    phase: "place",
    lastScoreGain: 0,
  };
  void remaining;
}

export function reducer(state: KingdomBuilderState, action: KingdomBuilderAction): KingdomBuilderState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "placeTile": {
      const { cellIndex, tile } = action;
      if (cellIndex < 0 || cellIndex >= GRID_SIZE * GRID_SIZE) return state;
      if (state.grid[cellIndex]!.tile !== "empty") return state;
      if (!state.hand.includes(tile)) return state;

      const newGrid = [...state.grid];
      newGrid[cellIndex] = { tile };
      const newHand = [...state.hand];
      const tileIdx = newHand.indexOf(tile);
      newHand.splice(tileIdx, 1);

      const newScore = computeScore(newGrid);
      const gain = newScore - state.score;
      const newTilesPlaced = state.tilesPlaced + 1;

      // Draw replacement tile
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);

      if (newTilesPlaced >= TOTAL_TILES) {
        return {
          ...state,
          rngSeed: nextSeed,
          grid: newGrid,
          hand: newHand,
          score: newScore,
          tilesPlaced: newTilesPlaced,
          phase: "done",
          lastScoreGain: gain,
        };
      }

      // Draw a new tile
      const poolRemainder = TILE_POOL.slice();
      const newTile = poolRemainder[Math.floor(rng2() * poolRemainder.length)] ?? "farm";
      newHand.push(newTile);

      return {
        ...state,
        rngSeed: nextSeed,
        grid: newGrid,
        hand: newHand,
        score: newScore,
        tilesPlaced: newTilesPlaced,
        lastScoreGain: gain,
      };
    }

    case "discardAndDraw": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const newHand = [...state.hand];
      if (newHand.length > 0) newHand.splice(0, 1); // discard first
      const newTile = TILE_POOL[Math.floor(rng2() * TILE_POOL.length)] ?? "farm";
      newHand.push(newTile);
      return { ...state, rngSeed: nextSeed, hand: newHand };
    }
  }
}

export function isTerminal(state: KingdomBuilderState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.score / 200) * 100))) };
}
