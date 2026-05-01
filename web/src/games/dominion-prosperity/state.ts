import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const DominionProsperity_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Boom Era",
  "scenarioEmoji": "💰",
  "progressLabel": "VP",
  "threatLabel": "Empty Piles",
  "moraleLabel": "Hand",
  "tactics": [
    {
      "id": "plat",
      "label": "Buy Platinum",
      "emoji": "💎",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Huge money."
    },
    {
      "id": "buygold",
      "label": "Buy Gold",
      "emoji": "🪙",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "+money."
    },
    {
      "id": "buycolony",
      "label": "Colony",
      "emoji": "🏰",
      "effort": 6,
      "reliability": 0.5,
      "threatPush": 1,
      "desc": "Huge VP."
    },
    {
      "id": "draw",
      "label": "Draw",
      "emoji": "🃏",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Cycle."
    }
  ]
};

export interface DominionProsperitySettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type DominionProsperityState = CoopState;
export type DominionProsperityAction = { type: "play"; tacticId: string };

function diffNum(s: DominionProsperitySettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: DominionProsperitySettings): DominionProsperityState {
  return coopInitial(seed, DominionProsperity_CFG, diffNum(s));
}

export function reducer(state: DominionProsperityState, action: DominionProsperityAction): DominionProsperityState {
  if (action.type === "play") return coopStep(state, DominionProsperity_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: DominionProsperityState): { score: number } | null {
  const r = coopScore(state, DominionProsperity_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = DominionProsperity_CFG.totalRounds;
export const TARGET_SCORE = DominionProsperity_CFG.progressTarget;
export const FLAVOR = "Platinum + Colony big-money game.";
