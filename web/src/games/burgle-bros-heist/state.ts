import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const BurgleBrosHeist_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Three-Floor Vault",
  "scenarioEmoji": "💼",
  "progressLabel": "Loot",
  "threatLabel": "Guards",
  "moraleLabel": "Stealth",
  "tactics": [
    {
      "id": "crack",
      "label": "Crack Safe",
      "emoji": "🔓",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Open vault."
    },
    {
      "id": "sneak",
      "label": "Sneak",
      "emoji": "🤫",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Move quiet."
    },
    {
      "id": "hack",
      "label": "Hack Camera",
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

export interface BurgleBrosHeistSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type BurgleBrosHeistState = CoopState;
export type BurgleBrosHeistAction = { type: "play"; tacticId: string };

function diffNum(s: BurgleBrosHeistSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: BurgleBrosHeistSettings): BurgleBrosHeistState {
  return coopInitial(seed, BurgleBrosHeist_CFG, diffNum(s));
}

export function reducer(state: BurgleBrosHeistState, action: BurgleBrosHeistAction): BurgleBrosHeistState {
  if (action.type === "play") return coopStep(state, BurgleBrosHeist_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: BurgleBrosHeistState): { score: number } | null {
  const r = coopScore(state, BurgleBrosHeist_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = BurgleBrosHeist_CFG.totalRounds;
export const TARGET_SCORE = BurgleBrosHeist_CFG.progressTarget;
export const FLAVOR = "Crack safes; avoid alarms.";
