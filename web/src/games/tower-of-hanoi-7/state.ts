// Tower of Hanoi 7-disk variant: always 7 disks, tracks par and efficiency score.

export interface TowerOfHanoi7Settings {
  showHints: "yes" | "no";
}

export interface TowerOfHanoi7State {
  settings: TowerOfHanoi7Settings;
  pegs: readonly (readonly number[])[];
  selectedPeg: number | null;
  moves: number;
  won: boolean;
}

export type TowerOfHanoi7Action =
  | { type: "select"; peg: number }
  | { type: "restart" };

const NUM_DISKS = 7;
export const MIN_MOVES = (1 << NUM_DISKS) - 1; // 127

function freshPegs(): readonly (readonly number[])[] {
  const peg0 = Array.from({ length: NUM_DISKS }, (_, i) => NUM_DISKS - i);
  return [peg0, [], []];
}

export function initialState(_seed: number, settings: TowerOfHanoi7Settings): TowerOfHanoi7State {
  return {
    settings,
    pegs: freshPegs(),
    selectedPeg: null,
    moves: 0,
    won: false,
  };
}

function pegOf(pegs: readonly (readonly number[])[], d: number): number {
  for (let p = 0; p < 3; p++) {
    if (pegs[p]!.includes(d)) return p;
  }
  return -1;
}

function hintMove(state: TowerOfHanoi7State): { from: number; to: number } | null {
  const pegs = state.pegs;
  const n = NUM_DISKS;
  const nextMove = state.moves + 1;
  const smallPeg = pegOf(pegs, 1);
  if (smallPeg === -1) return null;

  if (nextMove % 2 === 1) {
    // Odd move: move disk 1
    // For odd n: clockwise 0→2→1→0; for even n: counter-clockwise 0→1→2→0
    const direction = n % 2 === 1 ? [0, 2, 1] : [0, 1, 2];
    const curPos = direction.indexOf(smallPeg);
    const nextPos = (curPos + 1) % 3;
    return { from: smallPeg, to: direction[nextPos]! };
  } else {
    // Even move: the only legal move not involving disk 1
    const smallPegIdx = smallPeg;
    for (let from = 0; from < 3; from++) {
      if (from === smallPegIdx) continue;
      const topFrom = pegs[from]![pegs[from]!.length - 1];
      if (topFrom === undefined) continue;
      for (let to = 0; to < 3; to++) {
        if (to === from || to === smallPegIdx) continue;
        const topTo = pegs[to]![pegs[to]!.length - 1];
        if (topTo === undefined || topFrom < topTo) {
          return { from, to };
        }
      }
    }
    return null;
  }
}

export function reducer(state: TowerOfHanoi7State, action: TowerOfHanoi7Action): TowerOfHanoi7State {
  if (action.type === "restart") {
    return initialState(0, state.settings);
  }

  if (action.type === "select") {
    if (state.won) return state;
    const { peg } = action;

    if (state.selectedPeg === null) {
      if (state.pegs[peg]!.length === 0) return state;
      // Show hint if enabled
      const hint = state.settings.showHints === "yes" ? hintMove(state) : null;
      void hint; // hint could be used for UI highlighting
      return { ...state, selectedPeg: peg };
    }

    if (state.selectedPeg === peg) {
      return { ...state, selectedPeg: null };
    }

    const from = state.selectedPeg;
    const to = peg;
    const fromPeg = state.pegs[from]!;
    const toPeg = state.pegs[to]!;
    const movingDisk = fromPeg[fromPeg.length - 1];

    if (movingDisk === undefined) return { ...state, selectedPeg: null };

    const topTo = toPeg[toPeg.length - 1];
    if (topTo !== undefined && movingDisk > topTo) {
      return { ...state, selectedPeg: null };
    }

    const newPegs = state.pegs.map((p, i) => {
      if (i === from) return p.slice(0, p.length - 1);
      if (i === to) return [...p, movingDisk];
      return p;
    });

    const moves = state.moves + 1;
    const won = newPegs[2]!.length === NUM_DISKS;

    return { ...state, pegs: newPegs, selectedPeg: null, moves, won };
  }

  return state;
}

export function isTerminal(state: TowerOfHanoi7State): { score: number } | null {
  if (!state.won) return null;
  // Score: 100 if solved in exactly MIN_MOVES, decreases by 1 for each extra move (min 10)
  const score = Math.max(10, 100 - (state.moves - MIN_MOVES));
  return { score };
}
