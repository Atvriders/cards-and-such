import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const KeyforgeArchons_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Archon Forge",
  "scenarioEmoji": "🗝️",
  "progressLabel": "Aember",
  "threatLabel": "Opponent Aember",
  "moraleLabel": "Keys",
  "tactics": [
    {
      "id": "reap",
      "label": "Reap",
      "emoji": "🌾",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "+aember."
    },
    {
      "id": "fight",
      "label": "Fight",
      "emoji": "⚔️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Remove enemy."
    },
    {
      "id": "forge",
      "label": "Forge Key",
      "emoji": "🗝️",
      "effort": 6,
      "reliability": 0.5,
      "threatPush": 2,
      "desc": "Major."
    },
    {
      "id": "draw",
      "label": "Draw",
      "emoji": "🃏",
      "effort": 2,
      "reliability": 1,
      "threatPush": 0,
      "desc": "Card."
    }
  ]
};

export interface KeyforgeArchonsSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type KeyforgeArchonsState = CoopState;
export type KeyforgeArchonsAction = { type: "play"; tacticId: string };

function diffNum(s: KeyforgeArchonsSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: KeyforgeArchonsSettings): KeyforgeArchonsState {
  return coopInitial(seed, KeyforgeArchons_CFG, diffNum(s));
}

export function reducer(state: KeyforgeArchonsState, action: KeyforgeArchonsAction): KeyforgeArchonsState {
  if (action.type === "play") return coopStep(state, KeyforgeArchons_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: KeyforgeArchonsState): { score: number } | null {
  const r = coopScore(state, KeyforgeArchons_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = KeyforgeArchons_CFG.totalRounds;
export const TARGET_SCORE = KeyforgeArchons_CFG.progressTarget;
export const FLAVOR = "Forge three keys before the AI Archon.";
