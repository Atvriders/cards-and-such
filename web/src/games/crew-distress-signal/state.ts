import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const CrewDistressSignal_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "SOS",
  "scenarioEmoji": "📡",
  "progressLabel": "Tasks",
  "threatLabel": "Static",
  "moraleLabel": "Battery",
  "tactics": [
    {
      "id": "lead",
      "label": "Lead",
      "emoji": "🎴",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Win."
    },
    {
      "id": "dump",
      "label": "Dump",
      "emoji": "💧",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Lose."
    },
    {
      "id": "distress",
      "label": "Distress",
      "emoji": "🚨",
      "effort": 4,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Signal."
    },
    {
      "id": "plan",
      "label": "Plan",
      "emoji": "🗒️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Reorder."
    }
  ]
};

export interface CrewDistressSignalSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type CrewDistressSignalState = CoopState;
export type CrewDistressSignalAction = { type: "play"; tacticId: string };

function diffNum(s: CrewDistressSignalSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: CrewDistressSignalSettings): CrewDistressSignalState {
  return coopInitial(seed, CrewDistressSignal_CFG, diffNum(s));
}

export function reducer(state: CrewDistressSignalState, action: CrewDistressSignalAction): CrewDistressSignalState {
  if (action.type === "play") return coopStep(state, CrewDistressSignal_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: CrewDistressSignalState): { score: number } | null {
  const r = coopScore(state, CrewDistressSignal_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = CrewDistressSignal_CFG.totalRounds;
export const TARGET_SCORE = CrewDistressSignal_CFG.progressTarget;
export const FLAVOR = "Distress tokens add pressure.";
