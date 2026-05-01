import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ForbiddenIslandCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Sinking Island",
  "scenarioEmoji": "🏝️",
  "progressLabel": "Treasures",
  "threatLabel": "Flood",
  "moraleLabel": "Tiles",
  "tactics": [
    {
      "id": "shoreup",
      "label": "Shore Up",
      "emoji": "🪨",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 2,
      "desc": "Push back the flood."
    },
    {
      "id": "capture",
      "label": "Capture Treasure",
      "emoji": "💎",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Major progress."
    },
    {
      "id": "move",
      "label": "Move/Swim",
      "emoji": "🏊",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Reposition."
    },
    {
      "id": "airlift",
      "label": "Airlift",
      "emoji": "🚁",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Emergency rescue."
    }
  ]
};

export interface ForbiddenIslandCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ForbiddenIslandCoopState = CoopState;
export type ForbiddenIslandCoopAction = { type: "play"; tacticId: string };

function diffNum(s: ForbiddenIslandCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ForbiddenIslandCoopSettings): ForbiddenIslandCoopState {
  return coopInitial(seed, ForbiddenIslandCoop_CFG, diffNum(s));
}

export function reducer(state: ForbiddenIslandCoopState, action: ForbiddenIslandCoopAction): ForbiddenIslandCoopState {
  if (action.type === "play") return coopStep(state, ForbiddenIslandCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ForbiddenIslandCoopState): { score: number } | null {
  const r = coopScore(state, ForbiddenIslandCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ForbiddenIslandCoop_CFG.totalRounds;
export const TARGET_SCORE = ForbiddenIslandCoop_CFG.progressTarget;
export const FLAVOR = "Capture four idols and escape via the helipad.";
