import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicIberia_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Iberian Peninsula",
  "scenarioEmoji": "🚂",
  "progressLabel": "Research",
  "threatLabel": "Infections",
  "moraleLabel": "Resilience",
  "tactics": [
    {
      "id": "rail",
      "label": "Build Rail",
      "emoji": "🚂",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Connect regions."
    },
    {
      "id": "purify",
      "label": "Purify Water",
      "emoji": "💧",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Prevent infection growth."
    },
    {
      "id": "cure",
      "label": "Research",
      "emoji": "🧪",
      "effort": 6,
      "reliability": 0.5,
      "threatPush": 0,
      "desc": "Toward a cure."
    },
    {
      "id": "hosp",
      "label": "Hospital",
      "emoji": "🏥",
      "effort": 3,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Steady care."
    }
  ]
};

export interface PandemicIberiaSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicIberiaState = CoopState;
export type PandemicIberiaAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicIberiaSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicIberiaSettings): PandemicIberiaState {
  return coopInitial(seed, PandemicIberia_CFG, diffNum(s));
}

export function reducer(state: PandemicIberiaState, action: PandemicIberiaAction): PandemicIberiaState {
  if (action.type === "play") return coopStep(state, PandemicIberia_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicIberiaState): { score: number } | null {
  const r = coopScore(state, PandemicIberia_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicIberia_CFG.totalRounds;
export const TARGET_SCORE = PandemicIberia_CFG.progressTarget;
export const FLAVOR = "Build railways and purify water to fight disease.";
