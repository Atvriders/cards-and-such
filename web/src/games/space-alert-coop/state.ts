import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SpaceAlertCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Mission T+10:00",
  "scenarioEmoji": "🛰️",
  "progressLabel": "Threats Cleared",
  "threatLabel": "Damage",
  "moraleLabel": "Hull",
  "tactics": [
    {
      "id": "fire",
      "label": "Fire Cannon",
      "emoji": "🔫",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "shield",
      "label": "Shield",
      "emoji": "🛡️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Protect."
    },
    {
      "id": "repair",
      "label": "Repair",
      "emoji": "🔧",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 2,
      "desc": "Fix hull."
    },
    {
      "id": "move",
      "label": "Move",
      "emoji": "➡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 0,
      "desc": "Crew shift."
    }
  ]
};

export interface SpaceAlertCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SpaceAlertCoopState = CoopState;
export type SpaceAlertCoopAction = { type: "play"; tacticId: string };

function diffNum(s: SpaceAlertCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SpaceAlertCoopSettings): SpaceAlertCoopState {
  return coopInitial(seed, SpaceAlertCoop_CFG, diffNum(s));
}

export function reducer(state: SpaceAlertCoopState, action: SpaceAlertCoopAction): SpaceAlertCoopState {
  if (action.type === "play") return coopStep(state, SpaceAlertCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SpaceAlertCoopState): { score: number } | null {
  const r = coopScore(state, SpaceAlertCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SpaceAlertCoop_CFG.totalRounds;
export const TARGET_SCORE = SpaceAlertCoop_CFG.progressTarget;
export const FLAVOR = "Plan a 10-minute mission against waves.";
