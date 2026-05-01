import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const SCHOOLS = ["fire", "ice", "arcane"] as const;
export type School = typeof SCHOOLS[number];
export const STARTING_MANA = 3;

export interface DiceWizardSpellSettings { dummy: boolean; }

export interface DiceWizardSpellState {
  rngSeed: number;
  round: number;
  mana: number;
  rolls: number[];
  chosen: School | null;
  score: number;
  phase: "channel" | "scored" | "done";
  lastDesc: string;
  lastPts: number;
}

export type DiceWizardSpellAction = { type: "roll" } | { type: "cast"; school: School } | { type: "next" };

function classify(rolls: number[]): { evens: number; odds: number; high: number; low: number; trip: boolean } {
  let evens = 0, odds = 0, high = 0, low = 0;
  for (const r of rolls) {
    if (r % 2 === 0) evens++; else odds++;
    if (r >= 5) high++;
    if (r <= 2) low++;
  }
  const counts = new Map<number, number>();
  rolls.forEach(r => counts.set(r, (counts.get(r) ?? 0) + 1));
  const trip = Array.from(counts.values()).some(c => c >= 3);
  return { evens, odds, high, low, trip };
}

export function spellPower(rolls: number[], school: School): { pts: number; desc: string } {
  const c = classify(rolls);
  if (school === "fire") {
    const base = c.high * 6 + c.odds * 2;
    const bonus = c.trip ? 18 : 0;
    return { pts: base + bonus, desc: `Fire ignites (${c.high}x high, ${c.odds}x odd${c.trip ? ", BURN!" : ""})` };
  }
  if (school === "ice") {
    const base = c.evens * 5 + c.low * 4;
    const bonus = c.trip ? 14 : 0;
    return { pts: base + bonus, desc: `Frost binds (${c.evens}x even, ${c.low}x low${c.trip ? ", FREEZE!" : ""})` };
  }
  const sum = rolls.reduce((a, b) => a + b, 0);
  const unique = new Set(rolls).size;
  return { pts: sum + unique * 4 + (c.trip ? 10 : 0), desc: `Arcane weaves (sum ${sum}, ${unique} unique)` };
}

export function initialState(seed: number, _settings: DiceWizardSpellSettings): DiceWizardSpellState {
  return { rngSeed: seed, round: 1, mana: STARTING_MANA, rolls: [], chosen: null, score: 0, phase: "channel", lastDesc: "", lastPts: 0 };
}

export function reducer(state: DiceWizardSpellState, action: DiceWizardSpellAction): DiceWizardSpellState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "channel") {
    if (state.mana <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < 4; i++) rolls.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, rolls, mana: state.mana - 1 };
  }
  if (action.type === "cast" && state.phase === "channel" && state.rolls.length > 0) {
    const { pts, desc } = spellPower(state.rolls, action.school);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, chosen: action.school, score: state.score + pts, lastDesc: desc, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, round: state.round + 1, mana: STARTING_MANA, rolls: [], chosen: null, phase: "channel", lastDesc: "", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceWizardSpellState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
