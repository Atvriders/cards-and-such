import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface VolcanoEscapeSettings {
  speed: "slow" | "normal" | "fast";
}

export interface Lava {
  col: number;
  row: number;
}

export interface VolcanoEscapeState {
  settings: VolcanoEscapeSettings;
  cols: number;
  rows: number;
  playerRow: number;
  playerCol: number;
  lavaBlobs: Lava[];
  tick: number;
  escaped: boolean;
  gameOver: boolean;
  score: number;
  message: string;
  rngSeed: number;
}

export type VolcanoEscapeAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "tick" }
  | { type: "restart" };

const COLS = 7;
const ROWS = 8;

function spawnLava(rng: () => number, count: number): Lava[] {
  return Array.from({ length: count }, () => ({
    col: Math.floor(rng() * COLS),
    row: 0,
  }));
}

export function initialState(seed: number, settings: VolcanoEscapeSettings): VolcanoEscapeState {
  const rng = mulberry32(seed);
  const count = settings.speed === "fast" ? 4 : settings.speed === "normal" ? 3 : 2;
  const lavaBlobs = spawnLava(rng, count);
  return {
    settings,
    cols: COLS,
    rows: ROWS,
    playerRow: ROWS - 1,
    playerCol: Math.floor(COLS / 2),
    lavaBlobs,
    tick: 0,
    escaped: false,
    gameOver: false,
    score: 0,
    message: "Escape before lava reaches you!",
    rngSeed: seed,
  };
}

function moveLava(blobs: Lava[], rng: () => number): Lava[] {
  return blobs.map(b => ({
    col: Math.max(0, Math.min(COLS - 1, b.col + Math.floor(rng() * 3) - 1)),
    row: Math.min(ROWS, b.row + 1),
  }));
}

export function reducer(state: VolcanoEscapeState, action: VolcanoEscapeAction): VolcanoEscapeState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "move") {
    let { playerRow, playerCol } = state;
    if (action.dir === "up") playerRow = Math.max(0, playerRow - 1);
    else if (action.dir === "down") playerRow = Math.min(state.rows - 1, playerRow + 1);
    else if (action.dir === "left") playerCol = Math.max(0, playerCol - 1);
    else if (action.dir === "right") playerCol = Math.min(state.cols - 1, playerCol + 1);

    const hit = state.lavaBlobs.some(b => b.row === playerRow && b.col === playerCol);
    const escaped = playerRow === 0;
    return {
      ...state,
      playerRow,
      playerCol,
      escaped,
      gameOver: hit || escaped,
      score: escaped ? state.tick * 10 + 500 : state.score,
      message: escaped ? "Escaped!" : hit ? "Caught by lava!" : state.message,
    };
  }

  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed + state.tick * 7);
    const newLava = moveLava(state.lavaBlobs, rng);
    const spawnRng = mulberry32(state.rngSeed + state.tick * 13);
    const extra: Lava[] = spawnRng() < 0.3 ? [{ col: Math.floor(spawnRng() * COLS), row: 0 }] : [];
    const allLava = [...newLava, ...extra].filter(b => b.row < ROWS);
    const hit = allLava.some(b => b.row === state.playerRow && b.col === state.playerCol);
    return {
      ...state,
      lavaBlobs: allLava,
      tick: state.tick + 1,
      gameOver: hit,
      message: hit ? "Caught by lava!" : `Tick ${state.tick + 1} — dodge!`,
    };
  }
  return state;
}

export function isTerminal(state: VolcanoEscapeState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.escaped ? state.score : Math.max(0, state.tick * 10)) };
}
