import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ChroniclesOfCrime_CFG: DeductionConfig = {
  "mode": "exact",
  "answerLength": 3,
  "poolSize": 6,
  "allowRepeats": false,
  "maxGuesses": 10,
  "symbolLabels": [
    "🔍",
    "🔪",
    "💊",
    "🪢",
    "🔫",
    "🪤"
  ],
  "scenarioLabel": "Crime Scene",
  "scenarioEmoji": "🚨"
};

export interface ChroniclesOfCrimeSettings { dummy: boolean; }
export type ChroniclesOfCrimeState = DeductionState;
export type ChroniclesOfCrimeAction = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ChroniclesOfCrimeSettings): ChroniclesOfCrimeState {
  return deductionInitial(seed, ChroniclesOfCrime_CFG);
}

export function reducer(state: ChroniclesOfCrimeState, action: ChroniclesOfCrimeAction): ChroniclesOfCrimeState {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ChroniclesOfCrime_CFG);
  return state;
}

export function isTerminal(state: ChroniclesOfCrimeState): { score: number } | null {
  const r = deductionScore(state, ChroniclesOfCrime_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = "Pin down weapon / motive / suspect.";
