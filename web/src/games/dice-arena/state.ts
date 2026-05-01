import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Opponent { name: string; hp: number; maxHp: number; atkDie: number; reward: number; }

export interface DiceArenaSettings { dummy: boolean; }

export const PLAYER_HP = 20;

export interface DiceArenaState {
  rngSeed: number;
  myHp: number;
  opps: Opponent[];
  current: number;
  rolls: { mine: [number, number]; theirs: number } | null;
  score: number;
  phase: "fight" | "result" | "done";
  log: string;
}

export type DiceArenaAction = { type: "fight" } | { type: "next" };

const ROSTER: ReadonlyArray<Omit<Opponent, "hp">> = [
  { name: "Retiarius", maxHp: 8, atkDie: 4, reward: 12 },
  { name: "Murmillo", maxHp: 14, atkDie: 6, reward: 22 },
  { name: "Champion", maxHp: 22, atkDie: 8, reward: 40 },
];

export function initialState(seed: number, _settings: DiceArenaSettings): DiceArenaState {
  const opps = ROSTER.map(o => ({ ...o, hp: o.maxHp }));
  return { rngSeed: seed, myHp: PLAYER_HP, opps, current: 0, rolls: null, score: 0, phase: "fight", log: "" };
}

export function reducer(state: DiceArenaState, action: DiceArenaAction): DiceArenaState {
  if (state.phase === "done") return state;
  if (action.type === "fight" && state.phase === "fight") {
    const rng = mulberry32(state.rngSeed);
    const m1 = 1 + Math.floor(rng()*6);
    const m2 = 1 + Math.floor(rng()*6);
    const opp = state.opps[state.current]!;
    const t = 1 + Math.floor(rng() * opp.atkDie);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const myAtk = m1 + m2 + (m1 === m2 ? 4 : 0);
    const newHp = Math.max(0, opp.hp - myAtk);
    const opps = state.opps.map((o, i) => i === state.current ? { ...o, hp: newHp } : o);
    let myHp = state.myHp - (newHp > 0 ? t : 0);
    if (myHp < 0) myHp = 0;
    let score = state.score;
    let log = `Atk ${myAtk}${m1 === m2 ? " (DOUBLES)" : ""}.`;
    if (newHp > 0) log += ` ${opp.name} hits ${t}.`;
    let phase: DiceArenaState["phase"] = "result";
    if (newHp === 0) {
      score += opp.reward;
      log += ` ${opp.name} defeated! +${opp.reward}.`;
    }
    if (myHp === 0) phase = "done";
    return { ...state, rngSeed: nextSeed, opps, myHp, rolls: { mine: [m1, m2], theirs: t }, score, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    let { current, opps } = state;
    if (opps[current]!.hp === 0) current++;
    if (current >= opps.length) {
      return { ...state, current, phase: "done", log: "Champion of the arena! +40 bonus.", score: state.score + 40, rolls: null };
    }
    return { ...state, current, phase: "fight", rolls: null, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceArenaState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
