import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MageKnightCard_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Knight's Quest",
  "scenarioEmoji": "🛡️",
  "progressLabel": "Conquest",
  "threatLabel": "Mana Drain",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "⚔️",
      "effort": 6,
      "reliability": 0.65,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "move",
      "label": "Move",
      "emoji": "🐎",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Travel."
    },
    {
      "id": "recruit",
      "label": "Recruit",
      "emoji": "🤝",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Unit."
    },
    {
      "id": "rest",
      "label": "Rest",
      "emoji": "🌙",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface MageKnightCardSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MageKnightCardState = CoopState;
export type MageKnightCardAction = { type: "play"; tacticId: string };

function diffNum(s: MageKnightCardSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MageKnightCardSettings): MageKnightCardState {
  return coopInitial(seed, MageKnightCard_CFG, diffNum(s));
}

export function reducer(state: MageKnightCardState, action: MageKnightCardAction): MageKnightCardState {
  if (action.type === "play") return coopStep(state, MageKnightCard_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MageKnightCardState): { score: number } | null {
  const r = coopScore(state, MageKnightCard_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MageKnightCard_CFG.totalRounds;
export const TARGET_SCORE = MageKnightCard_CFG.progressTarget;
export const FLAVOR = "Plan multi-step combos.";
