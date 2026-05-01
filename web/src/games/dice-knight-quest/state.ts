import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const KNIGHT_MAX_HP = 30;

export interface Monster { name: string; hp: number; maxHp: number; def: number; reward: number; }

export interface DiceKnightQuestSettings { dummy: boolean; }

export interface DiceKnightQuestState {
  rngSeed: number;
  round: number;
  knightHp: number;
  monsters: Monster[];
  current: number;
  score: number;
  phase: "attack" | "result" | "victory" | "defeat" | "done";
  lastAttack: number | null;
  lastDamageDealt: number;
  lastDamageTaken: number;
  log: string;
}

export type DiceKnightQuestAction = { type: "attack" } | { type: "next" };

const ROSTER: ReadonlyArray<Omit<Monster, "hp">> = [
  { name: "Goblin",   maxHp: 6,  def: 7,  reward: 5 },
  { name: "Orc",      maxHp: 10, def: 9,  reward: 8 },
  { name: "Wolf",     maxHp: 8,  def: 8,  reward: 6 },
  { name: "Troll",    maxHp: 14, def: 11, reward: 12 },
  { name: "Wraith",   maxHp: 12, def: 13, reward: 14 },
  { name: "Ogre",     maxHp: 16, def: 10, reward: 14 },
  { name: "Lich",     maxHp: 18, def: 15, reward: 20 },
  { name: "Demon",    maxHp: 22, def: 16, reward: 28 },
];

export function initialState(seed: number, _settings: DiceKnightQuestSettings): DiceKnightQuestState {
  const monsters = ROSTER.map(m => ({ ...m, hp: m.maxHp }));
  return {
    rngSeed: seed, round: 1, knightHp: KNIGHT_MAX_HP,
    monsters, current: 0, score: 0, phase: "attack",
    lastAttack: null, lastDamageDealt: 0, lastDamageTaken: 0, log: "",
  };
}

export function reducer(state: DiceKnightQuestState, action: DiceKnightQuestAction): DiceKnightQuestState {
  if (state.phase === "done") return state;
  if (action.type === "attack" && state.phase === "attack") {
    const rng = mulberry32(state.rngSeed);
    const atk = 1 + Math.floor(rng() * 20);
    const dmg = 1 + Math.floor(rng() * 6);
    const counter = 1 + Math.floor(rng() * 4);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const monster = state.monsters[state.current]!;
    const hit = atk >= monster.def;
    const dealt = hit ? dmg : 0;
    const newHp = Math.max(0, monster.hp - dealt);
    const taken = hit && newHp === 0 ? 0 : counter;
    const knightHp = Math.max(0, state.knightHp - taken);
    const monsters = state.monsters.map((m, i) => i === state.current ? { ...m, hp: newHp } : m);
    let phase: DiceKnightQuestState["phase"] = "result";
    let score = state.score;
    let log = hit ? `Strike! ${dealt} dmg.` : `Miss (${atk} vs def ${monster.def}).`;
    if (taken > 0) log += ` Counter ${taken}.`;
    if (newHp === 0) {
      score += monster.reward;
      log += ` ${monster.name} slain (+${monster.reward}).`;
      phase = "victory";
    }
    if (knightHp === 0) phase = "defeat";
    return { ...state, rngSeed: nextSeed, monsters, knightHp, score, phase, lastAttack: atk, lastDamageDealt: dealt, lastDamageTaken: taken, log };
  }
  if (action.type === "next") {
    if (state.phase === "result") {
      return { ...state, phase: "attack", lastAttack: null, lastDamageDealt: 0, lastDamageTaken: 0, log: "" };
    }
    if (state.phase === "victory") {
      const next = state.current + 1;
      if (next >= state.monsters.length) {
        const bonus = state.knightHp * 2;
        return { ...state, score: state.score + bonus, phase: "done", log: `Quest complete! +${bonus} HP bonus.` };
      }
      return { ...state, current: next, round: state.round + 1, phase: "attack", lastAttack: null, lastDamageDealt: 0, lastDamageTaken: 0, log: "" };
    }
    if (state.phase === "defeat") {
      return { ...state, phase: "done" };
    }
  }
  return state;
}

export function isTerminal(state: DiceKnightQuestState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
