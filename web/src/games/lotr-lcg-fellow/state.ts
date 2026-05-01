import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const LotrLcgFellow_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Fellowship Campaign",
  "scenarioEmoji": "💍",
  "progressLabel": "Quest",
  "threatLabel": "Threat",
  "moraleLabel": "Heroes",
  "tactics": [
    {
      "id": "quest",
      "label": "Quest",
      "emoji": "🌟",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 2,
      "desc": "Quest."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🗡️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Slay."
    },
    {
      "id": "aid",
      "label": "Aid",
      "emoji": "🤝",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Help."
    },
    {
      "id": "heal",
      "label": "Heal",
      "emoji": "💖",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface LotrLcgFellowSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type LotrLcgFellowState = CoopState;
export type LotrLcgFellowAction = { type: "play"; tacticId: string };

function diffNum(s: LotrLcgFellowSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: LotrLcgFellowSettings): LotrLcgFellowState {
  return coopInitial(seed, LotrLcgFellow_CFG, diffNum(s));
}

export function reducer(state: LotrLcgFellowState, action: LotrLcgFellowAction): LotrLcgFellowState {
  if (action.type === "play") return coopStep(state, LotrLcgFellow_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: LotrLcgFellowState): { score: number } | null {
  const r = coopScore(state, LotrLcgFellow_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = LotrLcgFellow_CFG.totalRounds;
export const TARGET_SCORE = LotrLcgFellow_CFG.progressTarget;
export const FLAVOR = "Saga deck campaign with persistent rewards.";
