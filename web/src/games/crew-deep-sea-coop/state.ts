import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const CrewDeepSeaCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Atlantis Mission",
  "scenarioEmoji": "🐙",
  "progressLabel": "Tasks Done",
  "threatLabel": "Mistakes",
  "moraleLabel": "Air",
  "tactics": [
    {
      "id": "lead",
      "label": "Lead Trick",
      "emoji": "🎴",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Win trick."
    },
    {
      "id": "dump",
      "label": "Dump Trick",
      "emoji": "💧",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Lose trick."
    },
    {
      "id": "signal",
      "label": "Signal",
      "emoji": "📡",
      "effort": 4,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Hint."
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

export interface CrewDeepSeaCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type CrewDeepSeaCoopState = CoopState;
export type CrewDeepSeaCoopAction = { type: "play"; tacticId: string };

function diffNum(s: CrewDeepSeaCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: CrewDeepSeaCoopSettings): CrewDeepSeaCoopState {
  return coopInitial(seed, CrewDeepSeaCoop_CFG, diffNum(s));
}

export function reducer(state: CrewDeepSeaCoopState, action: CrewDeepSeaCoopAction): CrewDeepSeaCoopState {
  if (action.type === "play") return coopStep(state, CrewDeepSeaCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: CrewDeepSeaCoopState): { score: number } | null {
  const r = coopScore(state, CrewDeepSeaCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = CrewDeepSeaCoop_CFG.totalRounds;
export const TARGET_SCORE = CrewDeepSeaCoop_CFG.progressTarget;
export const FLAVOR = "Win specific tricks in specific order.";
