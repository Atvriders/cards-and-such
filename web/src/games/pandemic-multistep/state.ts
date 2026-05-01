import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicMultistep_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Outbreak Chain",
  "scenarioEmoji": "🔗",
  "progressLabel": "Steps Completed",
  "threatLabel": "Spread",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "treatfly",
      "label": "Treat+Fly",
      "emoji": "💉",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 2,
      "desc": "Treat then move."
    },
    {
      "id": "buildres",
      "label": "Build+Research",
      "emoji": "🏥",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Build & research."
    },
    {
      "id": "dispatch",
      "label": "Dispatch",
      "emoji": "🚀",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Move ally."
    },
    {
      "id": "emerg",
      "label": "Emergency",
      "emoji": "🚨",
      "effort": 3,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Big push."
    }
  ]
};

export interface PandemicMultistepSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicMultistepState = CoopState;
export type PandemicMultistepAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicMultistepSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicMultistepSettings): PandemicMultistepState {
  return coopInitial(seed, PandemicMultistep_CFG, diffNum(s));
}

export function reducer(state: PandemicMultistepState, action: PandemicMultistepAction): PandemicMultistepState {
  if (action.type === "play") return coopStep(state, PandemicMultistep_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicMultistepState): { score: number } | null {
  const r = coopScore(state, PandemicMultistep_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicMultistep_CFG.totalRounds;
export const TARGET_SCORE = PandemicMultistep_CFG.progressTarget;
export const FLAVOR = "Each tactic chains: minor + major effect. Keep ahead of spread.";
