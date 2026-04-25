// Wire Connect: rotate tiles so wires connect from the power source to all endpoints.

export interface WireConnectSettings {
  size: "4" | "5" | "6";
}

// Each tile has connections on [north, east, south, west] (true = has wire)
export interface Tile {
  connections: [boolean, boolean, boolean, boolean]; // N, E, S, W
  rotation: number; // 0..3 (each = 90 degrees clockwise)
  fixed: boolean; // power source is fixed
}

export interface WireConnectState {
  settings: WireConnectSettings;
  size: number;
  tiles: readonly Tile[];
  sourceIndex: number;
  moves: number;
  won: boolean;
}

export type WireConnectAction = { type: "rotate"; index: number };

// Rotate connections 90 degrees clockwise: [N,E,S,W] => [W,N,E,S]
function rotateConns(c: [boolean,boolean,boolean,boolean]): [boolean,boolean,boolean,boolean] {
  return [c[3], c[0], c[1], c[2]];
}

export function getEffectiveConns(tile: Tile): [boolean,boolean,boolean,boolean] {
  let c: [boolean,boolean,boolean,boolean] = [...tile.connections];
  for (let i = 0; i < tile.rotation; i++) {
    c = rotateConns(c);
  }
  return c;
}

function neighbor(index: number, dir: number, size: number): number {
  const row = Math.floor(index / size);
  const col = index % size;
  if (dir === 0) return row > 0 ? (row - 1) * size + col : -1;          // N
  if (dir === 1) return col < size - 1 ? row * size + (col + 1) : -1;   // E
  if (dir === 2) return row < size - 1 ? (row + 1) * size + col : -1;   // S
  return col > 0 ? row * size + (col - 1) : -1;                          // W
}

const OPPOSITE = [2, 3, 0, 1]; // opposite of N=S, E=W, S=N, W=E

export function isConnected(tiles: readonly Tile[], size: number, sourceIndex: number): boolean {
  const total = size * size;
  const visited = new Set<number>();
  const queue = [sourceIndex];
  visited.add(sourceIndex);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const conns = getEffectiveConns(tiles[cur]!);
    for (let d = 0; d < 4; d++) {
      if (!conns[d]) continue;
      const nb = neighbor(cur, d, size);
      if (nb < 0) continue;
      const nbConns = getEffectiveConns(tiles[nb]!);
      if (!nbConns[OPPOSITE[d]!]) continue;
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }

  // Check all endpoint tiles are reached
  for (let i = 0; i < total; i++) {
    const c = getEffectiveConns(tiles[i]!);
    const hasAnyWire = c.some(Boolean);
    if (hasAnyWire && !visited.has(i)) return false;
  }
  return true;
}

// Tile type shortcuts: [N,E,S,W]
const STRAIGHT_NS: [boolean,boolean,boolean,boolean] = [true,false,true,false];
const STRAIGHT_EW: [boolean,boolean,boolean,boolean] = [false,true,false,true];
const CURVE_NE: [boolean,boolean,boolean,boolean] = [true,true,false,false];
const CURVE_ES: [boolean,boolean,boolean,boolean] = [false,true,true,false];
const CURVE_SW: [boolean,boolean,boolean,boolean] = [false,false,true,true];
const CURVE_NW: [boolean,boolean,boolean,boolean] = [true,false,false,true];
const TEE_NES: [boolean,boolean,boolean,boolean] = [true,true,true,false];
const TEE_ESW: [boolean,boolean,boolean,boolean] = [false,true,true,true];
const CROSS: [boolean,boolean,boolean,boolean] = [true,true,true,true];
const DEAD_N: [boolean,boolean,boolean,boolean] = [true,false,false,false];

function makeTile(c: [boolean,boolean,boolean,boolean], rotation = 0, fixed = false): Tile {
  return { connections: c, rotation, fixed };
}

// Puzzles: define solved state, then we'll scramble rotations randomly
interface PuzzleDef {
  size: number;
  tiles: Tile[]; // solved rotation
  sourceIndex: number;
}

const PUZZLES: PuzzleDef[] = [
  // 4x4 puzzles
  {
    size: 4,
    sourceIndex: 0,
    tiles: [
      makeTile(CURVE_ES, 0, true), makeTile(STRAIGHT_EW), makeTile(CURVE_SW), makeTile(DEAD_N, 2),
      makeTile(STRAIGHT_NS),       makeTile(CROSS),        makeTile(STRAIGHT_NS), makeTile(DEAD_N, 1),
      makeTile(CURVE_NE),          makeTile(STRAIGHT_EW),  makeTile(TEE_NES),  makeTile(CURVE_NW),
      makeTile(DEAD_N, 3),         makeTile(DEAD_N, 3),    makeTile(CURVE_NE), makeTile(CURVE_NW),
    ],
  },
  {
    size: 4,
    sourceIndex: 5,
    tiles: [
      makeTile(DEAD_N, 3),   makeTile(CURVE_SW),     makeTile(CURVE_NW),    makeTile(DEAD_N, 3),
      makeTile(CURVE_ES),    makeTile(CROSS, 0, true),makeTile(STRAIGHT_EW), makeTile(CURVE_SW),
      makeTile(DEAD_N, 2),   makeTile(CURVE_NE),      makeTile(TEE_ESW),    makeTile(STRAIGHT_NS),
      makeTile(DEAD_N, 3),   makeTile(DEAD_N, 3),     makeTile(CURVE_NE),   makeTile(CURVE_NW),
    ],
  },
  // 5x5 puzzle
  {
    size: 5,
    sourceIndex: 12,
    tiles: [
      makeTile(DEAD_N, 3),  makeTile(CURVE_SW),     makeTile(DEAD_N, 2), makeTile(CURVE_SW),     makeTile(DEAD_N, 3),
      makeTile(CURVE_ES),   makeTile(TEE_NES),       makeTile(STRAIGHT_NS), makeTile(TEE_NES),   makeTile(CURVE_SW),
      makeTile(DEAD_N, 2),  makeTile(STRAIGHT_NS),   makeTile(CROSS, 0, true), makeTile(STRAIGHT_NS), makeTile(DEAD_N, 2),
      makeTile(CURVE_ES),   makeTile(TEE_ESW),       makeTile(STRAIGHT_NS), makeTile(TEE_ESW),   makeTile(CURVE_NW),
      makeTile(DEAD_N, 3),  makeTile(CURVE_NE),     makeTile(DEAD_N, 2), makeTile(CURVE_NW),     makeTile(DEAD_N, 3),
    ],
  },
  // 6x6 puzzle
  {
    size: 6,
    sourceIndex: 14,
    tiles: [
      makeTile(DEAD_N,3),  makeTile(CURVE_SW),   makeTile(DEAD_N,2), makeTile(CURVE_SW),   makeTile(DEAD_N,2), makeTile(DEAD_N,3),
      makeTile(CURVE_ES),  makeTile(TEE_NES),    makeTile(STRAIGHT_NS), makeTile(TEE_NES), makeTile(CURVE_SW), makeTile(DEAD_N,3),
      makeTile(DEAD_N,2),  makeTile(STRAIGHT_NS),makeTile(TEE_ESW),  makeTile(STRAIGHT_NS),makeTile(TEE_NES), makeTile(CURVE_SW),
      makeTile(CURVE_ES),  makeTile(STRAIGHT_NS),makeTile(CROSS, 0, true), makeTile(STRAIGHT_NS),makeTile(STRAIGHT_NS), makeTile(STRAIGHT_NS),
      makeTile(DEAD_N,2),  makeTile(TEE_ESW),    makeTile(STRAIGHT_NS), makeTile(TEE_ESW), makeTile(CURVE_NW), makeTile(DEAD_N,3),
      makeTile(DEAD_N,3),  makeTile(CURVE_NE),   makeTile(CURVE_NW), makeTile(CURVE_NE),   makeTile(DEAD_N,2), makeTile(DEAD_N,3),
    ],
  },
];

export function initialState(seed: number, settings: WireConnectSettings): WireConnectState {
  const size = parseInt(settings.size);
  const sizeMatch = PUZZLES.filter(p => p.size === size);
  const p = sizeMatch[seed % sizeMatch.length]!;

  // Scramble non-fixed tiles by applying random rotations
  const scramble = (seed * 1664525 + 1013904223) >>> 0;
  const tiles: Tile[] = p.tiles.map((tile, i) => {
    if (tile.fixed) return { ...tile };
    const r = ((scramble ^ (i * 7919)) % 4 + 4) % 4;
    return { ...tile, rotation: (tile.rotation + r) % 4 };
  });

  const won = isConnected(tiles, size, p.sourceIndex);

  return {
    settings,
    size,
    tiles,
    sourceIndex: p.sourceIndex,
    moves: 0,
    won,
  };
}

export function reducer(state: WireConnectState, action: WireConnectAction): WireConnectState {
  if (action.type !== "rotate") return state;
  if (state.won) return state;
  if (state.tiles[action.index]?.fixed) return state;

  const newTiles = state.tiles.map((t, i) => {
    if (i !== action.index) return t;
    return { ...t, rotation: (t.rotation + 1) % 4 };
  });

  const won = isConnected(newTiles, state.size, state.sourceIndex);
  return {
    ...state,
    tiles: newTiles,
    moves: state.moves + 1,
    won,
  };
}

export function isTerminal(state: WireConnectState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 600 - state.moves * 5) };
}
