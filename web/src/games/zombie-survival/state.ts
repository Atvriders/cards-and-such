import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ZombieSurvivalSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Zombie {
  id: number;
  x: number; // 0..6
  y: number; // 0..6, player is at bottom row
  hp: number;
}

export interface ZombieSurvivalState {
  settings: ZombieSurvivalSettings;
  rngSeed: number;
  tick: number;
  playerX: number;
  playerHp: number;
  ammo: number;
  zombies: Zombie[];
  nextId: number;
  score: number;
  day: number;
  gameOver: boolean;
  barricadeRow: number; // row index where barricade sits (between player and zombies)
  barricadeHp: number;
}

export type ZombieSurvivalAction =
  | { type: "tick" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "shoot" }
  | { type: "restart" };

const COLS = 7;
const ROWS = 7;
const PLAYER_ROW = 6;
const BARRICADE_ROW = 5;

function difficultyParams(d: ZombieSurvivalSettings["difficulty"]) {
  if (d === "easy") return { spawnRate: 6, zombieHp: 1 };
  if (d === "hard") return { spawnRate: 3, zombieHp: 2 };
  return { spawnRate: 5, zombieHp: 1 };
}

export function initialState(seed: number, settings: ZombieSurvivalSettings): ZombieSurvivalState {
  return {
    settings,
    rngSeed: seed,
    tick: 0,
    playerX: 3,
    playerHp: 5,
    ammo: 20,
    zombies: [],
    nextId: 0,
    score: 0,
    day: 1,
    gameOver: false,
    barricadeRow: BARRICADE_ROW,
    barricadeHp: 6,
  };
}

export function reducer(state: ZombieSurvivalState, action: ZombieSurvivalAction): ZombieSurvivalState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "moveLeft") {
    return { ...state, playerX: Math.max(0, state.playerX - 1) };
  }
  if (action.type === "moveRight") {
    return { ...state, playerX: Math.min(COLS - 1, state.playerX + 1) };
  }
  if (action.type === "shoot") {
    if (state.ammo <= 0) return state;
    // Shoot straight up from playerX, hit first zombie in that column
    const col = state.playerX;
    const colZombies = state.zombies.filter(z => z.x === col).sort((a, b) => b.y - a.y);
    if (colZombies.length === 0) {
      return { ...state, ammo: state.ammo - 1 };
    }
    const target = colZombies[0]!;
    const newHp = target.hp - 1;
    let score = state.score;
    let zombies: Zombie[];
    if (newHp <= 0) {
      score += 10;
      zombies = state.zombies.filter(z => z.id !== target.id);
    } else {
      zombies = state.zombies.map(z => z.id === target.id ? { ...z, hp: newHp } : z);
    }
    return { ...state, ammo: state.ammo - 1, zombies, score };
  }

  if (action.type === "tick") {
    const tick = state.tick + 1;
    const rng = mulberry32(state.rngSeed + tick);
    const params = difficultyParams(state.settings.difficulty);

    // Move zombies down
    let zombies = state.zombies.map(z => ({ ...z, y: z.y + 1 }));

    // Zombies hitting barricade
    let barricadeHp = state.barricadeHp;
    const atBarricade = zombies.filter(z => z.y >= BARRICADE_ROW && z.y < PLAYER_ROW);
    if (atBarricade.length > 0 && barricadeHp > 0) {
      barricadeHp -= atBarricade.length;
      zombies = zombies.filter(z => z.y < BARRICADE_ROW || z.y >= PLAYER_ROW);
    }

    // Zombies reaching player
    const atPlayer = zombies.filter(z => z.y >= PLAYER_ROW);
    let playerHp = state.playerHp - atPlayer.length;
    zombies = zombies.filter(z => z.y < PLAYER_ROW);

    // Spawn zombie
    let { nextId, day } = state;
    const ammo = state.ammo + (tick % 8 === 0 ? 3 : 0); // passive ammo refill

    if (tick % params.spawnRate === 0) {
      const col = Math.floor(rng() * COLS);
      zombies = [...zombies, { id: nextId++, x: col, y: 0, hp: params.zombieHp + Math.floor(day / 4) }];
    }

    if (tick % 20 === 0) day++;

    const gameOver = playerHp <= 0;

    return {
      ...state,
      tick,
      zombies,
      nextId,
      day,
      playerHp: Math.max(0, playerHp),
      ammo,
      score: state.score,
      barricadeHp: Math.max(0, barricadeHp),
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: ZombieSurvivalState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, state.score) };
}
