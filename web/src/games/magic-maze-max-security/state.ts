import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MagicMazeMaxSecurity_CFG: CoopEngineConfig = {
  "totalRounds": 9,
  "progressTarget": 50,
  "threatPerRound": 5,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Max Security",
  "scenarioEmoji": "📹",
  "progressLabel": "Items",
  "threatLabel": "Cameras",
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
      "id": "disable",
      "label": "Disable Camera",
      "emoji": "📵",
      "effort": 4,
      "reliability": 0.75,
      "threatPush": 2,
      "desc": "Stop camera."
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
      "label": "Flip",
      "emoji": "⏳",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Reset."
    }
  ]
};

export interface MagicMazeMaxSecuritySettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MagicMazeMaxSecurityState = CoopState;
export type MagicMazeMaxSecurityAction = { type: "play"; tacticId: string };

function diffNum(s: MagicMazeMaxSecuritySettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MagicMazeMaxSecuritySettings): MagicMazeMaxSecurityState {
  return coopInitial(seed, MagicMazeMaxSecurity_CFG, diffNum(s));
}

export function reducer(state: MagicMazeMaxSecurityState, action: MagicMazeMaxSecurityAction): MagicMazeMaxSecurityState {
  if (action.type === "play") return coopStep(state, MagicMazeMaxSecurity_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MagicMazeMaxSecurityState): { score: number } | null {
  const r = coopScore(state, MagicMazeMaxSecurity_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MagicMazeMaxSecurity_CFG.totalRounds;
export const TARGET_SCORE = MagicMazeMaxSecurity_CFG.progressTarget;
export const FLAVOR = "Cameras eat time aggressively.";
