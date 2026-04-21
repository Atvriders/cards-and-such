import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NonogramSettings {
  size: "5" | "10" | "15";
}

// Cell states: 0=unknown, 1=filled, 2=marked empty (X)
export type CellState = 0 | 1 | 2;

export interface NonogramState {
  settings: NonogramSettings;
  size: number;
  solution: readonly boolean[]; // row-major
  cells: readonly CellState[];  // row-major, player's current board
  rowClues: readonly (readonly number[])[];
  colClues: readonly (readonly number[])[];
  won: boolean;
  movesMade: number;
}

export type NonogramAction =
  | { type: "fill"; index: number }   // left-click: toggle filled
  | { type: "mark"; index: number };  // right/shift-click: toggle X

// ──────────────────────────────── hand-drawn patterns ──────────────────────────────────

// 5×5 patterns (25 bools each)
const PATTERNS_5: boolean[][] = [
  // Heart
  [false,true,false,true,false, true,true,true,true,true, true,true,true,true,true, false,true,true,true,false, false,false,true,false,false],
  // Diamond
  [false,false,true,false,false, false,true,true,true,false, true,true,true,true,true, false,true,true,true,false, false,false,true,false,false],
  // Cross
  [false,false,true,false,false, false,false,true,false,false, true,true,true,true,true, false,false,true,false,false, false,false,true,false,false],
  // T-shape
  [true,true,true,true,true, false,false,true,false,false, false,false,true,false,false, false,false,true,false,false, false,false,true,false,false],
  // Checkerboard corner
  [true,false,true,false,true, false,true,false,true,false, true,false,true,false,true, false,true,false,true,false, true,false,true,false,true],
  // Arrow right
  [false,false,true,false,false, false,false,false,true,false, true,true,true,true,true, false,false,false,true,false, false,false,true,false,false],
  // Z shape
  [true,true,true,true,true, false,false,false,true,false, false,false,true,false,false, false,true,false,false,false, true,true,true,true,true],
];

// 10×10 patterns (100 bools each) — house silhouette
const PATTERNS_10: boolean[][] = [
  // House
  (() => {
    const g = Array(100).fill(false) as boolean[];
    // Roof
    g[4]=true; g[14]=true; g[24]=true; g[25]=true; g[13]=true; g[26]=true; g[12]=true; g[27]=true;
    g[11]=true; g[28]=true; g[30]=true; g[31]=true; g[32]=true; g[33]=true; g[34]=true; g[35]=true; g[36]=true; g[37]=true; g[38]=true; g[39]=true;
    // Walls
    for(let r=4;r<10;r++){g[r*10]=true;g[r*10+9]=true;}
    // Floor
    for(let c=0;c<10;c++){g[90+c]=true;}
    // Door
    g[76]=true;g[77]=true;g[86]=true;g[87]=true;
    // Window left
    g[52]=true;g[53]=true;g[62]=true;g[63]=true;
    // Window right
    g[56]=true;g[57]=true;g[66]=true;g[67]=true;
    return g;
  })(),
  // Diagonal stripes
  (() => {
    const g = Array(100).fill(false) as boolean[];
    for(let r=0;r<10;r++) for(let c=0;c<10;c++) if((r+c)%3===0) g[r*10+c]=true;
    return g;
  })(),
  // Circle approximation
  (() => {
    const g = Array(100).fill(false) as boolean[];
    const cx=4.5, cy=4.5, r=4;
    for(let row=0;row<10;row++) for(let col=0;col<10;col++){
      const dx=col-cx, dy=row-cy, d=Math.sqrt(dx*dx+dy*dy);
      if(Math.abs(d-r)<1) g[row*10+col]=true;
    }
    return g;
  })(),
  // Chess-like pattern
  (() => {
    const g = Array(100).fill(false) as boolean[];
    for(let r=0;r<10;r++) for(let c=0;c<10;c++) if((r+c)%2===0) g[r*10+c]=true;
    return g;
  })(),
  // Letter H
  (() => {
    const g = Array(100).fill(false) as boolean[];
    for(let r=0;r<10;r++){g[r*10+1]=true;g[r*10+2]=true;g[r*10+7]=true;g[r*10+8]=true;}
    for(let c=0;c<10;c++){g[4*10+c]=true;g[5*10+c]=true;}
    return g;
  })(),
];

// 15×15 patterns (225 bools each)
const PATTERNS_15: boolean[][] = [
  // Frame + X inside
  (() => {
    const g = Array(225).fill(false) as boolean[];
    for(let c=0;c<15;c++){g[c]=true;g[14*15+c]=true;}
    for(let r=0;r<15;r++){g[r*15]=true;g[r*15+14]=true;}
    for(let i=0;i<15;i++){g[i*15+i]=true;g[i*15+(14-i)]=true;}
    return g;
  })(),
  // Target (concentric rings)
  (() => {
    const g = Array(225).fill(false) as boolean[];
    const cx=7, cy=7;
    for(let r=0;r<15;r++) for(let c=0;c<15;c++){
      const dx=c-cx, dy=r-cy, d=Math.round(Math.sqrt(dx*dx+dy*dy));
      if(d===2||d===4||d===6) g[r*15+c]=true;
    }
    return g;
  })(),
  // Spiral approximation
  (() => {
    const g = Array(225).fill(false) as boolean[];
    // top row
    for(let c=0;c<15;c++) g[c]=true;
    // right col down
    for(let r=0;r<14;r++) g[r*15+14]=true;
    // bottom row partial
    for(let c=2;c<14;c++) g[14*15+c]=true;
    // left col partial
    for(let r=2;r<14;r++) g[r*15]=true;
    // inner top
    for(let c=2;c<12;c++) g[2*15+c]=true;
    // inner right
    for(let r=2;r<12;r++) g[r*15+12]=true;
    // inner bottom
    for(let c=4;c<12;c++) g[12*15+c]=true;
    // inner left
    for(let r=4;r<12;r++) g[r*15+2]=true;
    return g;
  })(),
];

const ALL_PATTERNS: Record<number, boolean[][]> = { 5: PATTERNS_5, 10: PATTERNS_10, 15: PATTERNS_15 };

// ──────────────────────────────── clue generation ──────────────────────────────────

function computeLineClues(bits: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const b of bits) {
    if (b) { run++; }
    else if (run > 0) { clues.push(run); run = 0; }
  }
  if (run > 0) clues.push(run);
  return clues.length ? clues : [0];
}

function buildClues(solution: readonly boolean[], size: number) {
  const rowClues: number[][] = [];
  const colClues: number[][] = [];
  for (let r = 0; r < size; r++) {
    rowClues.push(computeLineClues(Array.from({ length: size }, (_, c) => solution[r * size + c]!)));
  }
  for (let c = 0; c < size; c++) {
    colClues.push(computeLineClues(Array.from({ length: size }, (_, r) => solution[r * size + c]!)));
  }
  return { rowClues, colClues };
}

function flipH(pattern: boolean[], size: number): boolean[] {
  const out: boolean[] = [];
  for (let r = 0; r < size; r++) for (let c = size - 1; c >= 0; c--) out.push(pattern[r * size + c]!);
  return out;
}

function flipV(pattern: boolean[], size: number): boolean[] {
  const out: boolean[] = [];
  for (let r = size - 1; r >= 0; r--) for (let c = 0; c < size; c++) out.push(pattern[r * size + c]!);
  return out;
}

export function initialState(seed: number, settings: NonogramSettings): NonogramState {
  const size = parseInt(settings.size, 10);
  const rng = mulberry32(seed);

  const patterns = ALL_PATTERNS[size]!;
  const pi = Math.floor(rng() * patterns.length);
  let solution = patterns[pi]!.slice();

  if (rng() > 0.5) solution = flipH(solution, size);
  if (rng() > 0.5) solution = flipV(solution, size);

  const { rowClues, colClues } = buildClues(solution, size);

  return {
    settings,
    size,
    solution,
    cells: new Array<CellState>(size * size).fill(0),
    rowClues,
    colClues,
    won: false,
    movesMade: 0,
  };
}

function checkWon(cells: readonly CellState[], solution: readonly boolean[]): boolean {
  return cells.every((c, i) => (c === 1) === solution[i]);
}

export function reducer(state: NonogramState, action: NonogramAction): NonogramState {
  if (state.won) return state;

  const { index } = action;
  if (index < 0 || index >= state.cells.length) return state;

  const newCells = state.cells.slice() as CellState[];

  if (action.type === "fill") {
    newCells[index] = newCells[index] === 1 ? 0 : 1;
  } else {
    newCells[index] = newCells[index] === 2 ? 0 : 2;
  }

  const won = checkWon(newCells, state.solution);
  return { ...state, cells: newCells, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: NonogramState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
