import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SorcererCityBuild_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Sorcerer's Capital",
  "scenarioEmoji": "🏰",
  "progressLabel": "Districts",
  "threatLabel": "Monsters",
  "moraleLabel": "Walls",
  "tactics": [
    {
      "id": "build",
      "label": "Build",
      "emoji": "🏗️",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Tile."
    },
    {
      "id": "magic",
      "label": "Cast Magic",
      "emoji": "✨",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Bonus."
    },
    {
      "id": "guard",
      "label": "Guard",
      "emoji": "🛡️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Defend."
    },
    {
      "id": "trade",
      "label": "Trade",
      "emoji": "💰",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Income."
    }
  ]
};

export interface SorcererCityBuildSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SorcererCityBuildState = CoopState;
export type SorcererCityBuildAction = { type: "play"; tacticId: string };

function diffNum(s: SorcererCityBuildSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SorcererCityBuildSettings): SorcererCityBuildState {
  return coopInitial(seed, SorcererCityBuild_CFG, diffNum(s));
}

export function reducer(state: SorcererCityBuildState, action: SorcererCityBuildAction): SorcererCityBuildState {
  if (action.type === "play") return coopStep(state, SorcererCityBuild_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SorcererCityBuildState): { score: number } | null {
  const r = coopScore(state, SorcererCityBuild_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SorcererCityBuild_CFG.totalRounds;
export const TARGET_SCORE = SorcererCityBuild_CFG.progressTarget;
export const FLAVOR = "Real-time tile placement.";
