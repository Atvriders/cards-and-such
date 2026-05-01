import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Monster { name: string; hp: number; maxHp: number; reward: number; }

export interface DiceMonsterMashSettings { dummy: boolean; }

export interface DiceMonsterMashState {
  rngSeed: number;
  monsters: Monster[];
  current: number;
  rolls: number[] | null;
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
  lastDmg: number;
}

export type DiceMonsterMashAction = { type: "smash" } | { type: "next" };

const ROSTER: ReadonlyArray<Omit<Monster, "hp">> = [
  { name: "Slime", maxHp: 8, reward: 6 },
  { name: "Skeleton", maxHp: 12, reward: 10 },
  { name: "Vampire", maxHp: 16, reward: 16 },
  { name: "Werewolf", maxHp: 20, reward: 22 },
  { name: "Beholder", maxHp: 26, reward: 32 },
];

export function initialState(seed: number, _settings: DiceMonsterMashSettings): DiceMonsterMashState {
  const monsters = ROSTER.map(m => ({ ...m, hp: m.maxHp }));
  return { rngSeed: seed, monsters, current: 0, rolls: null, score: 0, phase: "roll", log: "", lastDmg: 0 };
}

export function reducer(state: DiceMonsterMashState, action: DiceMonsterMashAction): DiceMonsterMashState {
  if (state.phase === "done") return state;
  if (action.type === "smash" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1 + Math.floor(rng()*6), 1 + Math.floor(rng()*6), 1 + Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const counts = new Map<number, number>();
    r.forEach(x => counts.set(x, (counts.get(x) ?? 0) + 1));
    const trip = Array.from(counts.values()).some(c => c >= 3);
    const pair = Array.from(counts.values()).some(c => c >= 2);
    let dmg = r[0]! + r[1]! + r[2]!;
    if (trip) dmg += 12;
    else if (pair) dmg += 4;
    const monster = state.monsters[state.current]!;
    const newHp = Math.max(0, monster.hp - dmg);
    const monsters = state.monsters.map((m, i) => i === state.current ? { ...m, hp: newHp } : m);
    let log = trip ? `TRIPLE smash for ${dmg}!` : pair ? `Pair smash ${dmg}.` : `Hit ${dmg}.`;
    let score = state.score;
    let current = state.current;
    let phase: DiceMonsterMashState["phase"] = "result";
    if (newHp === 0) {
      score += monster.reward;
      log += ` ${monster.name} smashed (+${monster.reward}).`;
    }
    return { ...state, rngSeed: nextSeed, rolls: r, monsters, score, phase, log, lastDmg: dmg };
  }
  if (action.type === "next" && state.phase === "result") {
    let { current, monsters } = state;
    if (monsters[current]!.hp === 0) current++;
    if (current >= monsters.length) {
      return { ...state, current, phase: "done", log: `All monsters mashed!`, score: state.score + 25, rolls: null };
    }
    return { ...state, current, phase: "roll", rolls: null, log: "", lastDmg: 0 };
  }
  return state;
}

export function isTerminal(state: DiceMonsterMashState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
