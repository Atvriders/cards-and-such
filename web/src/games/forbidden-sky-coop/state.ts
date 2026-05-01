import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ForbiddenSkyCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 65,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Lightning Storm",
  "scenarioEmoji": "⚡",
  "progressLabel": "Rocket",
  "threatLabel": "Strikes",
  "moraleLabel": "Heart",
  "tactics": [
    {
      "id": "wire",
      "label": "Wire",
      "emoji": "🔌",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Connect circuits."
    },
    {
      "id": "part",
      "label": "Build Stage",
      "emoji": "🚀",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Big build."
    },
    {
      "id": "rope",
      "label": "Rope",
      "emoji": "🪢",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Climb."
    },
    {
      "id": "ground",
      "label": "Ground",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Lightning rod."
    }
  ]
};

export interface ForbiddenSkyCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ForbiddenSkyCoopState = CoopState;
export type ForbiddenSkyCoopAction = { type: "play"; tacticId: string };

function diffNum(s: ForbiddenSkyCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ForbiddenSkyCoopSettings): ForbiddenSkyCoopState {
  return coopInitial(seed, ForbiddenSkyCoop_CFG, diffNum(s));
}

export function reducer(state: ForbiddenSkyCoopState, action: ForbiddenSkyCoopAction): ForbiddenSkyCoopState {
  if (action.type === "play") return coopStep(state, ForbiddenSkyCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ForbiddenSkyCoopState): { score: number } | null {
  const r = coopScore(state, ForbiddenSkyCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ForbiddenSkyCoop_CFG.totalRounds;
export const TARGET_SCORE = ForbiddenSkyCoop_CFG.progressTarget;
export const FLAVOR = "Wire circuits, dodge bolts.";
