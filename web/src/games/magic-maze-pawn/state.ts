import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MagicMazePawn_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Pawn Mode",
  "scenarioEmoji": "♟️",
  "progressLabel": "Items",
  "threatLabel": "Sand",
  "moraleLabel": "Resets",
  "tactics": [
    {
      "id": "move",
      "label": "Move",
      "emoji": "➡️",
      "effort": 5,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Move."
    },
    {
      "id": "explore",
      "label": "Explore",
      "emoji": "🗺️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Tile."
    },
    {
      "id": "escalator",
      "label": "Escalator",
      "emoji": "🛗",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Speed up."
    },
    {
      "id": "flip",
      "label": "Flip",
      "emoji": "⏳",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Reset."
    }
  ]
};

export interface MagicMazePawnSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MagicMazePawnState = CoopState;
export type MagicMazePawnAction = { type: "play"; tacticId: string };

function diffNum(s: MagicMazePawnSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MagicMazePawnSettings): MagicMazePawnState {
  return coopInitial(seed, MagicMazePawn_CFG, diffNum(s));
}

export function reducer(state: MagicMazePawnState, action: MagicMazePawnAction): MagicMazePawnState {
  if (action.type === "play") return coopStep(state, MagicMazePawn_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MagicMazePawnState): { score: number } | null {
  const r = coopScore(state, MagicMazePawn_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MagicMazePawn_CFG.totalRounds;
export const TARGET_SCORE = MagicMazePawn_CFG.progressTarget;
export const FLAVOR = "Each pawn obeys one direction.";
