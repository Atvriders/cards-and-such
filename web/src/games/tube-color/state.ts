// Tube Color: water sort puzzle. Pour top color from one tube into another.

export interface TubeColorSettings {
  tubes: "6" | "8" | "10";
}

export interface TubeColorState {
  settings: TubeColorSettings;
  /** Each tube is an array of colors (bottom to top), max capacity 4 */
  tubes: readonly (readonly number[])[];
  selectedTube: number | null;
  moves: number;
  won: boolean;
}

export type TubeColorAction =
  | { type: "select"; tube: number }
  | { type: "pour"; from: number; to: number };

const CAPACITY = 4;

function canPour(from: readonly number[], to: readonly number[]): boolean {
  if (from.length === 0) return false;
  if (to.length >= CAPACITY) return false;
  if (to.length === 0) return true;
  return from[from.length - 1] === to[to.length - 1];
}

function pourTube(from: readonly number[], to: readonly number[]): { from: number[]; to: number[] } {
  const newFrom = [...from];
  const newTo = [...to];
  const color = newFrom[newFrom.length - 1]!;
  while (newFrom.length > 0 && newFrom[newFrom.length - 1] === color && newTo.length < CAPACITY) {
    newTo.push(newFrom.pop()!);
  }
  return { from: newFrom, to: newTo };
}

function checkWon(tubes: readonly (readonly number[])[]): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== CAPACITY) return false;
    const first = tube[0];
    if (!tube.every(c => c === first)) return false;
  }
  return true;
}

// Hand-crafted puzzles: each number is a color index
interface PuzzleDef { tubeCount: number; config: number[][] }

const PUZZLES: PuzzleDef[] = [
  // 6 tubes (4 colors + 2 empty)
  {
    tubeCount: 6,
    config: [
      [1, 2, 3, 4],
      [2, 1, 4, 3],
      [3, 4, 1, 2],
      [4, 3, 2, 1],
      [],
      [],
    ],
  },
  {
    tubeCount: 6,
    config: [
      [1, 1, 2, 3],
      [2, 3, 4, 1],
      [4, 2, 3, 4],
      [3, 4, 1, 2],
      [],
      [],
    ],
  },
  {
    tubeCount: 6,
    config: [
      [2, 1, 3, 4],
      [1, 3, 2, 4],
      [4, 2, 1, 3],
      [3, 4, 2, 1],
      [],
      [],
    ],
  },
  // 8 tubes (6 colors + 2 empty)
  {
    tubeCount: 8,
    config: [
      [1, 2, 3, 4],
      [5, 6, 1, 2],
      [3, 4, 5, 6],
      [2, 1, 6, 5],
      [4, 3, 2, 1],
      [6, 5, 4, 3],
      [],
      [],
    ],
  },
  {
    tubeCount: 8,
    config: [
      [1, 5, 3, 6],
      [2, 4, 1, 5],
      [6, 2, 4, 3],
      [5, 6, 2, 1],
      [3, 1, 6, 4],
      [4, 3, 5, 2],
      [],
      [],
    ],
  },
  // 10 tubes (8 colors + 2 empty)
  {
    tubeCount: 10,
    config: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [8, 7, 6, 5],
      [4, 3, 2, 1],
      [2, 8, 4, 6],
      [7, 1, 5, 3],
      [6, 4, 8, 2],
      [3, 5, 1, 7],
      [],
      [],
    ],
  },
  {
    tubeCount: 10,
    config: [
      [1, 3, 5, 7],
      [2, 4, 6, 8],
      [7, 5, 3, 1],
      [8, 6, 4, 2],
      [1, 6, 3, 8],
      [5, 2, 7, 4],
      [2, 7, 4, 5],
      [8, 3, 6, 1],
      [],
      [],
    ],
  },
  {
    tubeCount: 10,
    config: [
      [1, 2, 1, 3],
      [4, 5, 4, 6],
      [7, 8, 7, 5],
      [3, 6, 3, 8],
      [2, 7, 2, 4],
      [5, 8, 6, 1],
      [8, 3, 5, 7],
      [6, 1, 2, 4],
      [],
      [],
    ],
  },
];

export function initialState(seed: number, settings: TubeColorSettings): TubeColorState {
  const target = parseInt(settings.tubes);
  const matching = PUZZLES.filter(p => p.tubeCount === target);
  const p = matching[seed % matching.length]!;
  return {
    settings,
    tubes: p.config.map(t => [...t]),
    selectedTube: null,
    moves: 0,
    won: false,
  };
}

export function reducer(state: TubeColorState, action: TubeColorAction): TubeColorState {
  if (state.won) return state;

  if (action.type === "select") {
    const { tube } = action;
    if (state.selectedTube === null) {
      // Select non-empty tube
      if (state.tubes[tube]!.length === 0) return state;
      return { ...state, selectedTube: tube };
    } else if (state.selectedTube === tube) {
      // Deselect
      return { ...state, selectedTube: null };
    } else {
      // Attempt pour
      const from = state.selectedTube;
      const to = tube;
      if (!canPour(state.tubes[from]!, state.tubes[to]!)) {
        return { ...state, selectedTube: tube === from ? null : tube };
      }
      const { from: newFrom, to: newTo } = pourTube(state.tubes[from]!, state.tubes[to]!);
      const newTubes = state.tubes.map((t, i) => {
        if (i === from) return newFrom;
        if (i === to) return newTo;
        return [...t];
      });
      const won = checkWon(newTubes);
      return {
        ...state,
        tubes: newTubes,
        selectedTube: null,
        moves: state.moves + 1,
        won,
      };
    }
  }

  if (action.type === "pour") {
    const { from, to } = action;
    if (!canPour(state.tubes[from]!, state.tubes[to]!)) return state;
    const { from: newFrom, to: newTo } = pourTube(state.tubes[from]!, state.tubes[to]!);
    const newTubes = state.tubes.map((t, i) => {
      if (i === from) return newFrom;
      if (i === to) return newTo;
      return [...t];
    });
    const won = checkWon(newTubes);
    return { ...state, tubes: newTubes, moves: state.moves + 1, won };
  }

  return state;
}

export function isTerminal(state: TubeColorState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 600 - state.moves * 10) };
}
