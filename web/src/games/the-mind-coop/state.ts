import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const TheMindCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.5,
  "scenarioLabel": "Hive Mind",
  "scenarioEmoji": "🧠",
  "progressLabel": "Cards Played",
  "threatLabel": "Mistakes",
  "moraleLabel": "Lives",
  "tactics": [
    {
      "id": "focus",
      "label": "Focus",
      "emoji": "🧘",
      "effort": 5,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Sense timing."
    },
    {
      "id": "play",
      "label": "Play Card",
      "emoji": "🃏",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Risk play."
    },
    {
      "id": "wait",
      "label": "Wait",
      "emoji": "⏳",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Pause."
    },
    {
      "id": "sync",
      "label": "Sync",
      "emoji": "🔁",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Align."
    }
  ]
};

export interface TheMindCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type TheMindCoopState = CoopState;
export type TheMindCoopAction = { type: "play"; tacticId: string };

function diffNum(s: TheMindCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: TheMindCoopSettings): TheMindCoopState {
  return coopInitial(seed, TheMindCoop_CFG, diffNum(s));
}

export function reducer(state: TheMindCoopState, action: TheMindCoopAction): TheMindCoopState {
  if (action.type === "play") return coopStep(state, TheMindCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: TheMindCoopState): { score: number } | null {
  const r = coopScore(state, TheMindCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = TheMindCoop_CFG.totalRounds;
export const TARGET_SCORE = TheMindCoop_CFG.progressTarget;
export const FLAVOR = "Play cards in ascending order without speaking.";
