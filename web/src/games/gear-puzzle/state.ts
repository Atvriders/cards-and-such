// Gear Puzzle: place gears on a grid so the output gear spins when the input is turned.

export interface GearPuzzleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type GearSize = "small" | "large";

export interface GearSlot {
  col: number;
  row: number;
  /** null = empty slot */
  gear: GearSize | null;
  fixed: boolean;
}

export interface GearPuzzleState {
  settings: GearPuzzleSettings;
  /** Grid of gear slots */
  slots: readonly GearSlot[];
  cols: number;
  rows: number;
  /** Input gear slot index */
  inputSlot: number;
  /** Output gear slot index */
  outputSlot: number;
  /** Available gears to place */
  availableGears: readonly GearSize[];
  /** Currently selected gear from available pool */
  selectedGear: GearSize | null;
  moves: number;
  won: boolean;
}

export type GearPuzzleAction =
  | { type: "selectGear"; gear: GearSize }
  | { type: "placeGear"; slotIndex: number }
  | { type: "removeGear"; slotIndex: number };

function slotIndex(col: number, row: number, cols: number): number {
  return row * cols + col;
}

function neighbors(idx: number, cols: number, rows: number): number[] {
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const nbrs: number[] = [];
  if (col > 0) nbrs.push(slotIndex(col - 1, row, cols));
  if (col < cols - 1) nbrs.push(slotIndex(col + 1, row, cols));
  if (row > 0) nbrs.push(slotIndex(col, row - 1, cols));
  if (row < rows - 1) nbrs.push(slotIndex(col, row + 1, cols));
  return nbrs;
}

/** BFS to check if output gear is reachable from input through adjacent gears */
export function isChainConnected(slots: readonly GearSlot[], cols: number, rows: number, inputSlot: number, outputSlot: number): boolean {
  if (slots[inputSlot]?.gear === null || slots[outputSlot]?.gear === null) return false;
  const visited = new Set<number>();
  const queue = [inputSlot];
  visited.add(inputSlot);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === outputSlot) return true;
    for (const nb of neighbors(cur, cols, rows)) {
      if (visited.has(nb)) continue;
      if (slots[nb]?.gear !== null) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  return false;
}

interface PuzzleDef {
  cols: number;
  rows: number;
  slots: { col: number; row: number; gear: GearSize | null; fixed: boolean }[];
  inputSlot: number;
  outputSlot: number;
  availableGears: GearSize[];
}

const PUZZLES: PuzzleDef[] = [
  // Easy: 3x3 grid, need 1 bridge gear
  {
    cols: 3, rows: 3,
    inputSlot: 0, outputSlot: 8,
    slots: [
      { col:0, row:0, gear:"large", fixed:true },
      { col:1, row:0, gear:null, fixed:false },
      { col:2, row:0, gear:null, fixed:false },
      { col:0, row:1, gear:null, fixed:false },
      { col:1, row:1, gear:null, fixed:false },
      { col:2, row:1, gear:null, fixed:false },
      { col:0, row:2, gear:null, fixed:false },
      { col:1, row:2, gear:null, fixed:false },
      { col:2, row:2, gear:"small", fixed:true },
    ],
    availableGears: ["small", "small", "large"],
  },
  {
    cols: 3, rows: 3,
    inputSlot: 0, outputSlot: 2,
    slots: [
      { col:0, row:0, gear:"large", fixed:true },
      { col:1, row:0, gear:null, fixed:false },
      { col:2, row:0, gear:"small", fixed:true },
      { col:0, row:1, gear:null, fixed:false },
      { col:1, row:1, gear:null, fixed:false },
      { col:2, row:1, gear:null, fixed:false },
      { col:0, row:2, gear:null, fixed:false },
      { col:1, row:2, gear:null, fixed:false },
      { col:2, row:2, gear:null, fixed:false },
    ],
    availableGears: ["small"],
  },
  {
    cols: 4, rows: 3,
    inputSlot: 0, outputSlot: 11,
    slots: [
      { col:0, row:0, gear:"large", fixed:true },
      { col:1, row:0, gear:null, fixed:false },
      { col:2, row:0, gear:null, fixed:false },
      { col:3, row:0, gear:null, fixed:false },
      { col:0, row:1, gear:null, fixed:false },
      { col:1, row:1, gear:null, fixed:false },
      { col:2, row:1, gear:null, fixed:false },
      { col:3, row:1, gear:null, fixed:false },
      { col:0, row:2, gear:null, fixed:false },
      { col:1, row:2, gear:null, fixed:false },
      { col:2, row:2, gear:null, fixed:false },
      { col:3, row:2, gear:"small", fixed:true },
    ],
    availableGears: ["small", "large", "small"],
  },
  // Medium: 4x4 grid
  {
    cols: 4, rows: 4,
    inputSlot: 0, outputSlot: 15,
    slots: [
      { col:0, row:0, gear:"large", fixed:true },
      { col:1, row:0, gear:null, fixed:false },
      { col:2, row:0, gear:null, fixed:false },
      { col:3, row:0, gear:null, fixed:false },
      { col:0, row:1, gear:null, fixed:false },
      { col:1, row:1, gear:"small", fixed:true },
      { col:2, row:1, gear:null, fixed:false },
      { col:3, row:1, gear:null, fixed:false },
      { col:0, row:2, gear:null, fixed:false },
      { col:1, row:2, gear:null, fixed:false },
      { col:2, row:2, gear:"large", fixed:true },
      { col:3, row:2, gear:null, fixed:false },
      { col:0, row:3, gear:null, fixed:false },
      { col:1, row:3, gear:null, fixed:false },
      { col:2, row:3, gear:null, fixed:false },
      { col:3, row:3, gear:"small", fixed:true },
    ],
    availableGears: ["large", "small", "large"],
  },
  {
    cols: 4, rows: 4,
    inputSlot: 3, outputSlot: 12,
    slots: [
      { col:0, row:0, gear:null, fixed:false },
      { col:1, row:0, gear:null, fixed:false },
      { col:2, row:0, gear:null, fixed:false },
      { col:3, row:0, gear:"large", fixed:true },
      { col:0, row:1, gear:null, fixed:false },
      { col:1, row:1, gear:null, fixed:false },
      { col:2, row:1, gear:null, fixed:false },
      { col:3, row:1, gear:null, fixed:false },
      { col:0, row:2, gear:null, fixed:false },
      { col:1, row:2, gear:null, fixed:false },
      { col:2, row:2, gear:null, fixed:false },
      { col:3, row:2, gear:null, fixed:false },
      { col:0, row:3, gear:"small", fixed:true },
      { col:1, row:3, gear:null, fixed:false },
      { col:2, row:3, gear:null, fixed:false },
      { col:3, row:3, gear:null, fixed:false },
    ],
    availableGears: ["large", "small", "large", "small"],
  },
  // Hard: 5x5 grid
  {
    cols: 5, rows: 5,
    inputSlot: 0, outputSlot: 24,
    slots: Array.from({ length: 25 }, (_, i) => {
      const c = i % 5, r = Math.floor(i / 5);
      const fixed = i === 0 || i === 24;
      return { col: c, row: r, gear: i === 0 ? "large" : i === 24 ? "small" : null, fixed };
    }),
    availableGears: ["large", "small", "large", "small", "large"],
  },
  {
    cols: 5, rows: 5,
    inputSlot: 4, outputSlot: 20,
    slots: Array.from({ length: 25 }, (_, i) => {
      const c = i % 5, r = Math.floor(i / 5);
      const fixed = i === 4 || i === 20;
      return { col: c, row: r, gear: i === 4 ? "large" : i === 20 ? "small" : null, fixed };
    }),
    availableGears: ["small", "large", "small", "large", "small"],
  },
  {
    cols: 5, rows: 5,
    inputSlot: 2, outputSlot: 22,
    slots: Array.from({ length: 25 }, (_, i) => {
      const c = i % 5, r = Math.floor(i / 5);
      const isFixed = i === 2 || i === 22 || i === 12;
      return { col: c, row: r, gear: i === 2 ? "large" : i === 22 ? "small" : i === 12 ? "large" : null, fixed: isFixed };
    }),
    availableGears: ["small", "large", "small", "large"],
  },
];

export function initialState(seed: number, settings: GearPuzzleSettings): GearPuzzleState {
  const easy = 3, med = 2;
  let puzzleIndex: number;
  if (settings.difficulty === "easy") puzzleIndex = seed % easy;
  else if (settings.difficulty === "medium") puzzleIndex = easy + (seed % med);
  else puzzleIndex = easy + med + (seed % 3);

  const p = PUZZLES[puzzleIndex]!;
  return {
    settings,
    cols: p.cols,
    rows: p.rows,
    slots: p.slots.map(s => ({ ...s })),
    inputSlot: p.inputSlot,
    outputSlot: p.outputSlot,
    availableGears: [...p.availableGears],
    selectedGear: p.availableGears[0] ?? null,
    moves: 0,
    won: false,
  };
}

export function reducer(state: GearPuzzleState, action: GearPuzzleAction): GearPuzzleState {
  if (state.won) return state;

  if (action.type === "selectGear") {
    return { ...state, selectedGear: action.gear };
  }

  if (action.type === "removeGear") {
    const slot = state.slots[action.slotIndex];
    if (!slot || slot.fixed || slot.gear === null) return state;
    const slots = state.slots.map((s, i) => i === action.slotIndex ? { ...s, gear: null } : s);
    return { ...state, slots, moves: state.moves + 1 };
  }

  if (action.type === "placeGear") {
    const slot = state.slots[action.slotIndex];
    if (!slot || slot.fixed) return state;
    if (!state.selectedGear) return state;
    // Count how many of selectedGear are already placed
    const usedCount = state.slots.filter(s => !s.fixed && s.gear === state.selectedGear).length;
    const totalCount = state.availableGears.filter(g => g === state.selectedGear).length;
    if (usedCount >= totalCount && slot.gear !== state.selectedGear) return state;

    const slots = state.slots.map((s, i) =>
      i === action.slotIndex ? { ...s, gear: state.selectedGear } : s
    );
    const won = isChainConnected(slots, state.cols, state.rows, state.inputSlot, state.outputSlot);
    return { ...state, slots, moves: state.moves + 1, won };
  }

  return state;
}

export function isTerminal(state: GearPuzzleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.moves * 10) };
}
