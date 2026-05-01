import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MagicMazeCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Mall Heist",
  "scenarioEmoji": "🛍️",
  "progressLabel": "Items Stolen",
  "threatLabel": "Sand Timer",
  "moraleLabel": "Reset",
  "tactics": [
    {
      "id": "move",
      "label": "Move",
      "emoji": "➡️",
      "effort": 5,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Walk a direction."
    },
    {
      "id": "explore",
      "label": "Explore",
      "emoji": "🗺️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Reveal tile."
    },
    {
      "id": "vortex",
      "label": "Vortex",
      "emoji": "🌀",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Teleport."
    },
    {
      "id": "flip",
      "label": "Flip Timer",
      "emoji": "⏳",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Reset."
    }
  ]
};

export interface MagicMazeCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MagicMazeCoopState = CoopState;
export type MagicMazeCoopAction = { type: "play"; tacticId: string };

function diffNum(s: MagicMazeCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MagicMazeCoopSettings): MagicMazeCoopState {
  return coopInitial(seed, MagicMazeCoop_CFG, diffNum(s));
}

export function reducer(state: MagicMazeCoopState, action: MagicMazeCoopAction): MagicMazeCoopState {
  if (action.type === "play") return coopStep(state, MagicMazeCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MagicMazeCoopState): { score: number } | null {
  const r = coopScore(state, MagicMazeCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MagicMazeCoop_CFG.totalRounds;
export const TARGET_SCORE = MagicMazeCoop_CFG.progressTarget;
export const FLAVOR = "Each player controls a direction; reach all four exits.";
