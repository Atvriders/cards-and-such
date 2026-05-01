import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SHIPS = 6;

export interface Ship { name: string; def: number; reward: number; sunk: boolean; }

export interface DicePirateSettings { dummy: boolean; }

export interface DicePirateState {
  rngSeed: number;
  ships: Ship[];
  current: number;
  rolls: [number, number, number] | null;
  hp: number;
  score: number;
  phase: "fire" | "result" | "done";
  log: string;
}

export type DicePirateAction = { type: "fire" } | { type: "next" };

const NAMES = ["Sloop", "Galleon", "Frigate", "Manowar", "Royal", "Kraken"];

export function isWin(a: number, b: number): boolean { return a + b === 7; }

export function initialState(seed: number, _settings: DicePirateSettings): DicePirateState {
  const rng = mulberry32(seed);
  const ships: Ship[] = NAMES.map((n) => ({ name: n, def: 8 + Math.floor(rng() * 8), reward: 12 + Math.floor(rng() * 16), sunk: false }));
  return { rngSeed: Math.floor(rng() * 2 ** 31), ships, current: 0, rolls: null, hp: 6, score: 0, phase: "fire", log: "" };
}

export function reducer(state: DicePirateState, action: DicePirateAction): DicePirateState {
  if (state.phase === "done") return state;
  if (action.type === "fire" && state.phase === "fire") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const r3 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = r1 + r2 + r3;
    const ship = state.ships[state.current]!;
    const success = sum >= ship.def;
    const counts = new Map<number, number>();
    [r1, r2, r3].forEach(x => counts.set(x, (counts.get(x) ?? 0) + 1));
    const trip = Array.from(counts.values()).some(c => c >= 3);
    let pts = 0;
    let log = "";
    let ships = state.ships;
    let current = state.current;
    let hp = state.hp;
    if (success) {
      pts = ship.reward + (trip ? 16 : 0);
      ships = state.ships.map((s, i) => i === current ? { ...s, sunk: true } : s);
      log = `Plundered ${ship.name} (${sum} >= ${ship.def}). +${pts}.`;
      current++;
    } else {
      hp -= 1;
      log = `${ship.name} returned fire (${sum} < ${ship.def}). HP -1.`;
    }
    let phase: DicePirateState["phase"] = "result";
    if (current >= state.ships.length) {
      phase = "done";
      pts += 40;
      log += ` Sea conquered! +40.`;
    } else if (hp <= 0) {
      phase = "done";
      log += ` Crew mutinies.`;
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2, r3], score: state.score + pts, ships, current, hp, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "fire", rolls: null, log: "" };
  }
  return state;
}

export function isTerminal(state: DicePirateState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
