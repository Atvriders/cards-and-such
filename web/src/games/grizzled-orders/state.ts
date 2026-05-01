import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const GrizzledOrders_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Armistice",
  "scenarioEmoji": "✉️",
  "progressLabel": "Missions",
  "threatLabel": "Orders",
  "moraleLabel": "Morale",
  "tactics": [
    {
      "id": "play",
      "label": "Play",
      "emoji": "🎴",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Front."
    },
    {
      "id": "withdraw",
      "label": "Withdraw",
      "emoji": "🌙",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Retreat."
    },
    {
      "id": "speech",
      "label": "Speech",
      "emoji": "📣",
      "effort": 4,
      "reliability": 0.75,
      "threatPush": 2,
      "desc": "Morale."
    },
    {
      "id": "share",
      "label": "Share",
      "emoji": "🤝",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface GrizzledOrdersSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type GrizzledOrdersState = CoopState;
export type GrizzledOrdersAction = { type: "play"; tacticId: string };

function diffNum(s: GrizzledOrdersSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: GrizzledOrdersSettings): GrizzledOrdersState {
  return coopInitial(seed, GrizzledOrders_CFG, diffNum(s));
}

export function reducer(state: GrizzledOrdersState, action: GrizzledOrdersAction): GrizzledOrdersState {
  if (action.type === "play") return coopStep(state, GrizzledOrders_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: GrizzledOrdersState): { score: number } | null {
  const r = coopScore(state, GrizzledOrders_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = GrizzledOrders_CFG.totalRounds;
export const TARGET_SCORE = GrizzledOrders_CFG.progressTarget;
export const FLAVOR = "Fulfil orders before peace breaks.";
