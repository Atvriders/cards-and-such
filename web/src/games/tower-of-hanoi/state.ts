export interface TowerOfHanoiState {
  settings: { disks: "3" | "5" | "7" };
  /** Three pegs, each an array of disk sizes (largest first, index 0 = bottom) */
  pegs: readonly (readonly number[])[];
  /** Currently selected source peg (null = none selected) */
  selectedPeg: number | null;
  moves: number;
  hints: number;
  won: boolean;
  numDisks: number;
}

export type TowerOfHanoiAction =
  | { type: "select"; peg: number }
  | { type: "hint" };

export function initialState(
  _seed: number,
  settings: { disks: "3" | "5" | "7" },
): TowerOfHanoiState {
  const n = parseInt(settings.disks, 10);
  // Peg 0: disks stacked n..1 (index 0 = bottom = largest)
  const peg0 = Array.from({ length: n }, (_, i) => n - i);
  return {
    settings,
    pegs: [peg0, [], []],
    selectedPeg: null,
    moves: 0,
    hints: 0,
    won: false,
    numDisks: n,
  };
}

/** Find which peg disk d is on */
function pegOf(pegs: readonly (readonly number[])[], d: number): number {
  for (let p = 0; p < 3; p++) {
    if (pegs[p]!.includes(d)) return p;
  }
  return -1;
}

/**
 * Iterative optimal hint using the standard 3-peg Hanoi rule:
 * - Odd moves (1, 3, 5, ...): move the smallest disk
 * - Even moves (2, 4, 6, ...): make the only legal move not involving the smallest disk
 * - For odd n: disk 1 cycles 0 → 2 → 1 → 0 ... (clockwise)
 * - For even n: disk 1 cycles 0 → 1 → 2 → 0 ... (counter-clockwise)
 */
function hintMove(state: TowerOfHanoiState): { from: number; to: number } | null {
  const n = state.numDisks;
  const pegs = state.pegs;
  const nextMoveNumber = state.moves + 1; // 1-indexed next move

  const smallPeg = pegOf(pegs, 1);
  if (smallPeg === -1) return null;

  if (nextMoveNumber % 2 === 1) {
    // Odd move: move disk 1
    // For odd n: direction is clockwise (0→2→1→0)
    // For even n: direction is counter-clockwise (0→1→2→0)
    const clockwise = n % 2 === 1;
    const dest = clockwise
      ? (smallPeg + 2) % 3
      : (smallPeg + 1) % 3;
    return { from: smallPeg, to: dest };
  } else {
    // Even move: make the only legal move not involving disk 1
    const others = [0, 1, 2].filter((p) => p !== smallPeg) as [number, number];
    const [pA, pB] = others;
    const topA = pegs[pA]![pegs[pA]!.length - 1];
    const topB = pegs[pB]![pegs[pB]!.length - 1];

    if (topA === undefined && topB === undefined) return null;
    if (topA === undefined) return { from: pB, to: pA };
    if (topB === undefined) return { from: pA, to: pB };
    if (topA < topB) return { from: pA, to: pB };
    return { from: pB, to: pA };
  }
}

export function reducer(
  state: TowerOfHanoiState,
  action: TowerOfHanoiAction,
): TowerOfHanoiState {
  if (state.won) return state;

  switch (action.type) {
    case "select": {
      const { peg } = action;
      if (state.selectedPeg === null) {
        // First click: select source (only if non-empty)
        if (state.pegs[peg]!.length === 0) return state;
        return { ...state, selectedPeg: peg };
      } else {
        // Second click: attempt move
        const from = state.selectedPeg;
        const to = peg;

        if (from === to) {
          // Deselect
          return { ...state, selectedPeg: null };
        }

        const fromPeg = state.pegs[from]!;
        const toPeg = state.pegs[to]!;

        if (fromPeg.length === 0) {
          return { ...state, selectedPeg: null };
        }

        const disk = fromPeg[fromPeg.length - 1]!;
        const topOfDest = toPeg[toPeg.length - 1];

        if (topOfDest !== undefined && disk > topOfDest) {
          // Invalid move — larger on smaller
          return { ...state, selectedPeg: null };
        }

        const newPegs = state.pegs.map((p, i) => {
          if (i === from) return p.slice(0, -1);
          if (i === to) return [...p, disk];
          return p;
        });

        const won = newPegs[2]!.length === state.numDisks;
        return {
          ...state,
          pegs: newPegs,
          selectedPeg: null,
          moves: state.moves + 1,
          won,
        };
      }
    }

    case "hint": {
      const move = hintMove(state);
      if (!move) return state;

      const { from, to } = move;
      const fromPeg = state.pegs[from]!;
      const toPeg = state.pegs[to]!;
      const disk = fromPeg[fromPeg.length - 1]!;

      const newPegs = state.pegs.map((p, i) => {
        if (i === from) return p.slice(0, -1);
        if (i === to) return [...p, disk];
        return p;
      });

      const won = newPegs[2]!.length === state.numDisks;
      return {
        ...state,
        pegs: newPegs,
        selectedPeg: null,
        moves: state.moves + 1,
        hints: state.hints + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TowerOfHanoiState): { score: number } | null {
  if (!state.won) return null;
  const hintPenalty = state.hints * 50;
  const score = Math.max(50, 1000 - state.moves * 10 + hintPenalty * -1);
  return { score };
}

export function minMoves(n: number): number {
  return Math.pow(2, n) - 1;
}
