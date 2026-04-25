import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SlimeDefenseSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Slime {
  id: number;
  lane: number; // 0..4
  progress: number; // 0..10, reaches base at 10
  hp: number;
  color: "green" | "blue" | "red";
}

export interface SlimeDefenseState {
  settings: SlimeDefenseSettings;
  rngSeed: number;
  tick: number;
  slimes: Slime[];
  nextId: number;
  traps: number[]; // lane indices with traps placed
  baseHp: number;
  gold: number;
  score: number;
  wave: number;
  gameOver: boolean;
  selectedLane: number | null;
}

export type SlimeDefenseAction =
  | { type: "tick" }
  | { type: "selectLane"; lane: number }
  | { type: "placeTrap" }
  | { type: "restart" };

const LANES = 5;
const TRAP_COST = 4;

function slimeHp(color: Slime["color"], wave: number): number {
  const base = color === "green" ? 1 : color === "blue" ? 2 : 4;
  return base + Math.floor(wave / 3);
}

function difficultyParams(d: SlimeDefenseSettings["difficulty"]) {
  if (d === "easy") return { spawnRate: 5, speed: 1, maxWave: 5 };
  if (d === "hard") return { spawnRate: 3, speed: 2, maxWave: 12 };
  return { spawnRate: 4, speed: 1, maxWave: 8 };
}

export function initialState(seed: number, settings: SlimeDefenseSettings): SlimeDefenseState {
  return {
    settings,
    rngSeed: seed,
    tick: 0,
    slimes: [],
    nextId: 0,
    traps: [],
    baseHp: 8,
    gold: 12,
    score: 0,
    wave: 1,
    gameOver: false,
    selectedLane: null,
  };
}

export function reducer(state: SlimeDefenseState, action: SlimeDefenseAction): SlimeDefenseState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "selectLane") {
    return { ...state, selectedLane: action.lane };
  }

  if (action.type === "placeTrap") {
    if (state.selectedLane === null) return state;
    if (state.gold < TRAP_COST) return state;
    if (state.traps.includes(state.selectedLane)) return state;
    return {
      ...state,
      traps: [...state.traps, state.selectedLane],
      gold: state.gold - TRAP_COST,
      selectedLane: null,
    };
  }

  if (action.type === "tick") {
    const tick = state.tick + 1;
    const params = difficultyParams(state.settings.difficulty);
    const rng = mulberry32(state.rngSeed + tick);

    // Move slimes forward
    let slimes = state.slimes.map(s => ({ ...s, progress: s.progress + params.speed }));

    // Trap damage: slimes in trapped lanes take 1 damage
    let score = state.score;
    slimes = slimes.map(s => {
      if (state.traps.includes(s.lane)) {
        const newHp = s.hp - 1;
        if (newHp <= 0) { score += 5 + (s.color === "red" ? 15 : s.color === "blue" ? 8 : 0); }
        return { ...s, hp: newHp };
      }
      return s;
    }).filter(s => s.hp > 0);

    // Slimes that reached the base
    const reached = slimes.filter(s => s.progress >= 10);
    const baseHp = state.baseHp - reached.length;
    slimes = slimes.filter(s => s.progress < 10);

    const gold = state.gold + 1;
    let { nextId, wave } = state;

    // Spawn slimes
    if (tick % params.spawnRate === 0) {
      const lane = Math.floor(rng() * LANES);
      const colorRoll = rng();
      const color: Slime["color"] = colorRoll < 0.6 ? "green" : colorRoll < 0.85 ? "blue" : "red";
      slimes = [...slimes, { id: nextId++, lane, progress: 0, hp: slimeHp(color, wave), color }];
    }

    // Wave
    if (tick % (params.spawnRate * 10) === 0 && wave < params.maxWave) {
      wave++;
    }

    const gameOver = baseHp <= 0;

    return {
      ...state,
      tick,
      slimes,
      nextId,
      wave,
      baseHp: Math.max(0, baseHp),
      gold,
      score,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: SlimeDefenseState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, Math.floor(state.score / 4)) };
}
