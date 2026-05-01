import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicLegacyS2_CFG: CoopEngineConfig = {
  "totalRounds": 14,
  "progressTarget": 85,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.3,
  "scenarioLabel": "Year 71",
  "scenarioEmoji": "⚓",
  "progressLabel": "Reclaimed",
  "threatLabel": "Plague",
  "moraleLabel": "Havens",
  "tactics": [
    {
      "id": "supply",
      "label": "Supply Run",
      "emoji": "📦",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Move goods."
    },
    {
      "id": "scout",
      "label": "Scout",
      "emoji": "🔭",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Reveal."
    },
    {
      "id": "build",
      "label": "Establish",
      "emoji": "🏗️",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Construct outpost."
    },
    {
      "id": "guard",
      "label": "Guard",
      "emoji": "🛡️",
      "effort": 3,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Hold ground."
    }
  ]
};

export interface PandemicLegacyS2Settings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicLegacyS2State = CoopState;
export type PandemicLegacyS2Action = { type: "play"; tacticId: string };

function diffNum(s: PandemicLegacyS2Settings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicLegacyS2Settings): PandemicLegacyS2State {
  return coopInitial(seed, PandemicLegacyS2_CFG, diffNum(s));
}

export function reducer(state: PandemicLegacyS2State, action: PandemicLegacyS2Action): PandemicLegacyS2State {
  if (action.type === "play") return coopStep(state, PandemicLegacyS2_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicLegacyS2State): { score: number } | null {
  const r = coopScore(state, PandemicLegacyS2_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicLegacyS2_CFG.totalRounds;
export const TARGET_SCORE = PandemicLegacyS2_CFG.progressTarget;
export const FLAVOR = "Run supply lines; reclaim mainland regions.";
