// ─── Dominosa state ──────────────────────────────────────────────────────────
// 7×4 grid of numbers 0-6. Player places all 28 dominoes (each [a,b] pair unique).

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const MAX_PIP = 6;
// All 28 unique dominoes [0,0],[0,1],...,[6,6]
export function allDominoes(): [number, number][] {
  const d: [number, number][] = [];
  for (let a = 0; a <= MAX_PIP; a++)
    for (let b = a; b <= MAX_PIP; b++)
      d.push([a, b]);
  return d;
}

export const COLS = 8;
export const ROWS = 7;

export interface DominosaPuzzle {
  grid: number[][]; // ROWS x COLS values 0..6
  solution: Map<string, string>; // cellKey -> dominoKey
}

export interface DominosaClaim {
  cells: [string, string]; // the two cell keys claimed
  domino: [number, number];
}

export interface DominosaPuzzleSettings {
  hint: boolean;
}

export interface DominosaPuzzleState {
  settings: DominosaPuzzleSettings;
  grid: number[][];
  claims: DominosaClaim[];
  marks: Set<string>; // cell keys marked as "not this domino"
  solution: Map<string, string>;
  over: boolean;
  won: boolean;
}

export type DominosaPuzzleAction =
  | { type: "claim"; cells: [string, string] }
  | { type: "unclaim"; cells: [string, string] }
  | { type: "toggle-mark"; key: string };

function cellKey(r: number, c: number): string { return `${r},${c}`; }
function dominoKey(a: number, b: number): string {
  return a <= b ? `${a}-${b}` : `${b}-${a}`;
}

function buildPuzzle(seed: number): DominosaPuzzle {
  const rng = mulberry32(seed);
  const dominoes = allDominoes();
  // Shuffle dominoes
  for (let i = dominoes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [dominoes[i], dominoes[j]] = [dominoes[j]!, dominoes[i]!];
  }

  // Place dominoes into a 7×8 grid (56 cells = 28 dominoes × 2)
  // We'll try horizontal first, then vertical placements
  const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const solutionMap = new Map<string, string>();

  // Simple row-by-row placement: 4 horizontal dominoes per row × 7 rows = 28
  let di = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c += 2) {
      const [a, b] = dominoes[di]!;
      grid[r]![c] = a;
      grid[r]![c + 1] = b;
      const k1 = cellKey(r, c), k2 = cellKey(r, c + 1);
      const dk = dominoKey(a, b);
      solutionMap.set(k1, dk);
      solutionMap.set(k2, dk);
      di++;
    }
  }

  // Shuffle rows and columns to randomize look
  const rowPerm = Array.from({ length: ROWS }, (_, i) => i).sort(() => rng() - 0.5);
  const colPerm = Array.from({ length: COLS }, (_, i) => i).sort(() => rng() - 0.5);

  const shuffledGrid: number[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => grid[rowPerm[r]!]![colPerm[c]!] ?? 0)
  );

  // Update solutionMap for new positions
  const newSolution = new Map<string, string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const origKey = cellKey(rowPerm[r]!, colPerm[c]!);
      const dk = solutionMap.get(origKey);
      if (dk) newSolution.set(cellKey(r, c), dk);
    }
  }

  return { grid: shuffledGrid, solution: newSolution };
}

export function initialState(seed: number, settings: DominosaPuzzleSettings): DominosaPuzzleState {
  const puzzle = buildPuzzle(seed);
  return {
    settings,
    grid: puzzle.grid,
    claims: [],
    marks: new Set(),
    solution: puzzle.solution,
    over: false,
    won: false,
  };
}

function isAdjacent(k1: string, k2: string): boolean {
  const [r1, c1] = k1.split(",").map(Number) as [number, number];
  const [r2, c2] = k2.split(",").map(Number) as [number, number];
  return (Math.abs(r1 - r2) === 1 && c1 === c2) || (r1 === r2 && Math.abs(c1 - c2) === 1);
}

function checkWin(
  grid: number[][],
  claims: DominosaClaim[],
  solution: Map<string, string>
): boolean {
  // All 28 dominoes must be correctly placed
  if (claims.length !== 28) return false;
  for (const claim of claims) {
    const [k1, k2] = claim.cells;
    const solutionDk = solution.get(k1);
    if (!solutionDk) return false;
    if (solutionDk !== solution.get(k2)) return false;
    const claimDk = dominoKey(claim.domino[0], claim.domino[1]);
    if (claimDk !== solutionDk) return false;
  }
  return true;
}

export function reducer(state: DominosaPuzzleState, action: DominosaPuzzleAction): DominosaPuzzleState {
  if (state.over) return state;

  switch (action.type) {
    case "claim": {
      const [k1, k2] = action.cells;
      if (!isAdjacent(k1, k2)) return state;
      // Cells must not already be claimed
      const used = new Set(state.claims.flatMap((c) => [c.cells[0], c.cells[1]]));
      if (used.has(k1) || used.has(k2)) return state;
      const [r1, c1] = k1.split(",").map(Number) as [number, number];
      const [r2, c2] = k2.split(",").map(Number) as [number, number];
      const a = state.grid[r1]![c1]!;
      const b = state.grid[r2]![c2]!;
      const dk = dominoKey(a, b);
      // Check this domino isn't already placed
      if (state.claims.some((c) => dominoKey(c.domino[0], c.domino[1]) === dk)) return state;
      const newClaims = [...state.claims, { cells: [k1, k2] as [string, string], domino: [a, b] as [number, number] }];
      const won = checkWin(state.grid, newClaims, state.solution);
      return { ...state, claims: newClaims, over: won, won };
    }
    case "unclaim": {
      const [k1, k2] = action.cells;
      const newClaims = state.claims.filter(
        (c) => !(c.cells[0] === k1 && c.cells[1] === k2) && !(c.cells[0] === k2 && c.cells[1] === k1)
      );
      return { ...state, claims: newClaims };
    }
    case "toggle-mark": {
      const marks = new Set(state.marks);
      if (marks.has(action.key)) marks.delete(action.key);
      else marks.add(action.key);
      return { ...state, marks };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DominosaPuzzleState): { score: number } | null {
  if (state.over) return { score: state.won ? 1000 : 0 };
  return null;
}
