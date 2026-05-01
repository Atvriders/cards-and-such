import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const WALL_MAX = 80;
export const TURN_LIMIT = 12;
export const WEAPONS = ["cannon", "trebuchet", "sapper"] as const;
export type Weapon = typeof WEAPONS[number];

export interface DiceCastleSiegeSettings { dummy: boolean; }

export interface DiceCastleSiegeState {
  rngSeed: number;
  turn: number;
  wall: number;
  ammo: Record<Weapon, number>;
  rolls: number[];
  lastWeapon: Weapon | null;
  lastDmg: number;
  score: number;
  phase: "choose" | "result" | "done";
  log: string;
}

export type DiceCastleSiegeAction = { type: "fire"; weapon: Weapon } | { type: "next" };

export function damageOf(weapon: Weapon, rolls: number[]): number {
  if (weapon === "cannon") return rolls[0]! + rolls[1]! + (rolls[0] === rolls[1] ? 8 : 0);
  if (weapon === "trebuchet") return Math.max(...rolls) * 3;
  // sapper
  const sum = rolls[0]! + rolls[1]!;
  return sum >= 9 ? sum * 2 : 2;
}

export function initialState(seed: number, _settings: DiceCastleSiegeSettings): DiceCastleSiegeState {
  return {
    rngSeed: seed, turn: 1, wall: WALL_MAX,
    ammo: { cannon: 6, trebuchet: 4, sapper: 3 },
    rolls: [], lastWeapon: null, lastDmg: 0, score: 0, phase: "choose", log: "",
  };
}

export function reducer(state: DiceCastleSiegeState, action: DiceCastleSiegeAction): DiceCastleSiegeState {
  if (state.phase === "done") return state;
  if (action.type === "fire" && state.phase === "choose") {
    if (state.ammo[action.weapon] <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const dmg = damageOf(action.weapon, [r1, r2]);
    const wall = Math.max(0, state.wall - dmg);
    const ammo = { ...state.ammo, [action.weapon]: state.ammo[action.weapon] - 1 };
    let score = state.score + dmg;
    let phase: DiceCastleSiegeState["phase"] = "result";
    let log = `${action.weapon.toUpperCase()} hits for ${dmg}.`;
    if (wall === 0) {
      score += 50 + (TURN_LIMIT - state.turn) * 6;
      log += ` WALL BREACHED!`;
      phase = "done";
    } else if (state.turn >= TURN_LIMIT) {
      log += ` Time out — siege fails.`;
      phase = "done";
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], lastWeapon: action.weapon, lastDmg: dmg, wall, ammo, score, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, turn: state.turn + 1, phase: "choose", rolls: [], lastWeapon: null, lastDmg: 0, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceCastleSiegeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
