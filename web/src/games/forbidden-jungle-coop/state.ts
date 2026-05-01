import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ForbiddenJungleCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Tangled Vines",
  "scenarioEmoji": "🌿",
  "progressLabel": "Path Cleared",
  "threatLabel": "Vines",
  "moraleLabel": "Stamina",
  "tactics": [
    {
      "id": "hack",
      "label": "Hack",
      "emoji": "🪓",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 2,
      "desc": "Cut vines."
    },
    {
      "id": "relic",
      "label": "Relic",
      "emoji": "🗿",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Recover relic."
    },
    {
      "id": "trail",
      "label": "Blaze Trail",
      "emoji": "🥾",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Move team."
    },
    {
      "id": "camp",
      "label": "Camp",
      "emoji": "⛺",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Recover."
    }
  ]
};

export interface ForbiddenJungleCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ForbiddenJungleCoopState = CoopState;
export type ForbiddenJungleCoopAction = { type: "play"; tacticId: string };

function diffNum(s: ForbiddenJungleCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ForbiddenJungleCoopSettings): ForbiddenJungleCoopState {
  return coopInitial(seed, ForbiddenJungleCoop_CFG, diffNum(s));
}

export function reducer(state: ForbiddenJungleCoopState, action: ForbiddenJungleCoopAction): ForbiddenJungleCoopState {
  if (action.type === "play") return coopStep(state, ForbiddenJungleCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ForbiddenJungleCoopState): { score: number } | null {
  const r = coopScore(state, ForbiddenJungleCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ForbiddenJungleCoop_CFG.totalRounds;
export const TARGET_SCORE = ForbiddenJungleCoop_CFG.progressTarget;
export const FLAVOR = "Hack a path through cursed jungle.";
