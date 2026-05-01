import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const BurgleBrosMulti_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Heist Trilogy",
  "scenarioEmoji": "💎",
  "progressLabel": "Loot",
  "threatLabel": "Guards",
  "moraleLabel": "Stealth",
  "tactics": [
    {
      "id": "crack",
      "label": "Crack",
      "emoji": "🔓",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Vault."
    },
    {
      "id": "sneak",
      "label": "Sneak",
      "emoji": "🤫",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Move."
    },
    {
      "id": "hack",
      "label": "Hack",
      "emoji": "💻",
      "effort": 3,
      "reliability": 0.85,
      "threatPush": 2,
      "desc": "Disable."
    },
    {
      "id": "hide",
      "label": "Hide",
      "emoji": "🪟",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Avoid."
    }
  ]
};

export interface BurgleBrosMultiSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type BurgleBrosMultiState = CoopState;
export type BurgleBrosMultiAction = { type: "play"; tacticId: string };

function diffNum(s: BurgleBrosMultiSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: BurgleBrosMultiSettings): BurgleBrosMultiState {
  return coopInitial(seed, BurgleBrosMulti_CFG, diffNum(s));
}

export function reducer(state: BurgleBrosMultiState, action: BurgleBrosMultiAction): BurgleBrosMultiState {
  if (action.type === "play") return coopStep(state, BurgleBrosMulti_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: BurgleBrosMultiState): { score: number } | null {
  const r = coopScore(state, BurgleBrosMulti_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = BurgleBrosMulti_CFG.totalRounds;
export const TARGET_SCORE = BurgleBrosMulti_CFG.progressTarget;
export const FLAVOR = "Three vaults; persistent crew.";
