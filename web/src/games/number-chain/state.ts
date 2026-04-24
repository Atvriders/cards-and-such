import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NumberChainSettings {
  size: number;
}

export interface NumberChainState {
  settings: NumberChainSettings;
  size: number;
  // Grid: 0 = empty path cell, >0 = fixed number endpoint
  grid: readonly number[];
  // Player path: array of cell indices in order (head = last element)
  path: readonly number[];
  won: boolean;
  movesMade: number;
}

export type NumberChainAction =
  | { type: "extend"; index: number }
  | { type: "reset" };

// Generate a valid chain puzzle
function generatePuzzle(rng: () => number, size: number): { grid: number[]; endpoints: number[] } {
  const total = size * size;
  // Random Hamiltonian-ish path through grid
  const visited = new Array<boolean>(total).fill(false);
  const path: number[] = [];
  const startCell = Math.floor(rng() * total);
  path.push(startCell);
  visited[startCell] = true;

  function neighbors(idx: number): number[] {
    const r = Math.floor(idx / size);
    const c = idx % size;
    const ns: number[] = [];
    if (r > 0) ns.push((r - 1) * size + c);
    if (r < size - 1) ns.push((r + 1) * size + c);
    if (c > 0) ns.push(r * size + c - 1);
    if (c < size - 1) ns.push(r * size + c + 1);
    return ns;
  }

  // Simple DFS with backtracking (limited depth for speed)
  function dfs(maxDepth: number): boolean {
    if (path.length === total) return true;
    if (path.length >= maxDepth) return false;
    const cur = path[path.length - 1]!;
    const ns = neighbors(cur).filter((n) => !visited[n]);
    // Shuffle neighbors
    for (let i = ns.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [ns[i], ns[j]] = [ns[j]!, ns[i]!];
    }
    for (const n of ns) {
      visited[n] = true;
      path.push(n);
      if (dfs(maxDepth)) return true;
      path.pop();
      visited[n] = false;
    }
    return false;
  }

  dfs(total);

  // Select N waypoints along path as numbered endpoints
  const numEndpoints = Math.min(path.length, size + 1);
  const step = Math.floor(path.length / (numEndpoints - 1));
  const endpointIndices: number[] = [];
  for (let i = 0; i < numEndpoints - 1; i++) endpointIndices.push(i * step);
  endpointIndices.push(path.length - 1);

  const grid = new Array<number>(total).fill(0);
  endpointIndices.forEach((pi, label) => {
    grid[path[pi]!] = label + 1;
  });

  return { grid, endpoints: endpointIndices.map((pi) => path[pi]!) };
}

export function initialState(seed: number, settings: NumberChainSettings): NumberChainState {
  const rng = mulberry32(seed);
  const size = settings.size;
  const { grid } = generatePuzzle(rng, size);

  return {
    settings,
    size,
    grid,
    path: [],
    won: false,
    movesMade: 0,
  };
}

export function reducer(state: NumberChainState, action: NumberChainAction): NumberChainState {
  if (state.won) return state;

  if (action.type === "reset") {
    return { ...state, path: [], movesMade: state.movesMade };
  }

  if (action.type === "extend") {
    const { index } = action;
    const { size, grid, path } = state;
    if (index < 0 || index >= size * size) return state;

    // If path is empty, must start at endpoint 1
    if (path.length === 0) {
      if (grid[index] !== 1) return state;
      return { ...state, path: [index], movesMade: state.movesMade + 1 };
    }

    const head = path[path.length - 1]!;
    // Check adjacency
    const hr = Math.floor(head / size), hc = head % size;
    const ir = Math.floor(index / size), ic = index % size;
    const dist = Math.abs(hr - ir) + Math.abs(hc - ic);
    if (dist !== 1) return state;

    // Can't revisit except to retrace (backtrack)
    if (path.length >= 2 && path[path.length - 2] === index) {
      // Backtrack
      return { ...state, path: path.slice(0, -1), movesMade: state.movesMade + 1 };
    }
    if (path.includes(index)) return state;

    const newPath = [...path, index];

    // Check if we've hit the next endpoint in sequence
    const headVal = grid[head] ?? 0;
    const indexVal = grid[index] ?? 0;
    if (indexVal > 0) {
      // Must be hitting them in order
      const expectedLabel = newPath.filter((p) => (grid[p] ?? 0) > 0).length;
      if (indexVal !== expectedLabel) return state;
    }

    // Win: path visits all endpoints in order 1..N and ends at last
    const maxLabel = Math.max(...Array.from(grid));
    const won =
      indexVal === maxLabel &&
      newPath.filter((p) => (grid[p] ?? 0) > 0).length === maxLabel;

    void headVal;

    return { ...state, path: newPath, won, movesMade: state.movesMade + 1 };
  }

  return state;
}

export function isTerminal(state: NumberChainState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
