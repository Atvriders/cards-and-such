import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MountainClimbSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Platform {
  y: number;    // row from top (0 = top, max = bottom)
  x: number;    // column position 0..4
  width: number; // 1..3
}

export interface MountainClimbState {
  settings: MountainClimbSettings;
  platforms: Platform[];
  playerRow: number;
  playerCol: number;
  altitude: number;
  maxAltitude: number;
  lives: number;
  gameOver: boolean;
  won: boolean;
  message: string;
  rngSeed: number;
}

export type MountainClimbAction =
  | { type: "jump"; dir: "left" | "right" | "up" }
  | { type: "restart" };

const ROWS = 8;
const COLS = 5;
const WIN_ALTITUDE = 20;

function generatePlatforms(seed: number): Platform[] {
  const rng = mulberry32(seed);
  const platforms: Platform[] = [{ y: ROWS - 1, x: 2, width: 3 }]; // starting platform
  for (let y = ROWS - 2; y >= 0; y--) {
    if (rng() < 0.65) {
      const w = 1 + Math.floor(rng() * 3);
      const x = Math.floor(rng() * (COLS - w + 1));
      platforms.push({ y, x, width: w });
    }
  }
  return platforms;
}

function onPlatform(platforms: Platform[], row: number, col: number): boolean {
  return platforms.some(p => p.y === row && col >= p.x && col < p.x + p.width);
}

export function initialState(seed: number, settings: MountainClimbSettings): MountainClimbState {
  const platforms = generatePlatforms(seed);
  const startRow = ROWS - 1;
  const startCol = 2;
  return {
    settings,
    platforms,
    playerRow: startRow,
    playerCol: startCol,
    altitude: 0,
    maxAltitude: WIN_ALTITUDE + (settings.difficulty === "hard" ? 10 : settings.difficulty === "medium" ? 5 : 0),
    lives: settings.difficulty === "easy" ? 5 : settings.difficulty === "medium" ? 3 : 2,
    gameOver: false,
    won: false,
    message: "Jump up the mountain!",
    rngSeed: seed,
  };
}

export function reducer(state: MountainClimbState, action: MountainClimbAction): MountainClimbState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "jump" && !state.gameOver) {
    let { playerRow, playerCol, altitude, lives } = state;
    let newRow = playerRow, newCol = playerCol;
    if (action.dir === "up") newRow = Math.max(0, playerRow - 1);
    else if (action.dir === "left") newCol = Math.max(0, playerCol - 1);
    else if (action.dir === "right") newCol = Math.min(COLS - 1, playerCol + 1);

    const landed = onPlatform(state.platforms, newRow, newCol);
    if (!landed && action.dir === "up") {
      // fell — lose a life
      lives--;
      const gameOver = lives <= 0;
      return {
        ...state,
        lives,
        gameOver,
        message: gameOver ? "You fell off the mountain!" : `Missed! ${lives} lives left.`,
      };
    }
    if (action.dir === "up" && landed) altitude++;
    const won = altitude >= state.maxAltitude;
    return {
      ...state,
      playerRow: newRow,
      playerCol: newCol,
      altitude,
      won,
      gameOver: won,
      message: won ? "You reached the summit!" : `Altitude: ${altitude}/${state.maxAltitude}`,
    };
  }
  return state;
}

export function isTerminal(state: MountainClimbState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.won) {
    const lifeBonus = state.lives * 100;
    return { score: Math.min(1000, 600 + lifeBonus) };
  }
  return { score: Math.max(0, state.altitude * 20) };
}
