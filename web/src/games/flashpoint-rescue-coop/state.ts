import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const FlashpointRescueCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Burning Building",
  "scenarioEmoji": "🚒",
  "progressLabel": "Rescued",
  "threatLabel": "Fire",
  "moraleLabel": "Damage",
  "tactics": [
    {
      "id": "hose",
      "label": "Spray Hose",
      "emoji": "💦",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 2,
      "desc": "Reduce fire."
    },
    {
      "id": "rescue",
      "label": "Rescue",
      "emoji": "🆘",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Carry victim."
    },
    {
      "id": "chop",
      "label": "Chop Wall",
      "emoji": "🪓",
      "effort": 3,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Open path."
    },
    {
      "id": "drive",
      "label": "Drive Truck",
      "emoji": "🚒",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Big push."
    }
  ]
};

export interface FlashpointRescueCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type FlashpointRescueCoopState = CoopState;
export type FlashpointRescueCoopAction = { type: "play"; tacticId: string };

function diffNum(s: FlashpointRescueCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: FlashpointRescueCoopSettings): FlashpointRescueCoopState {
  return coopInitial(seed, FlashpointRescueCoop_CFG, diffNum(s));
}

export function reducer(state: FlashpointRescueCoopState, action: FlashpointRescueCoopAction): FlashpointRescueCoopState {
  if (action.type === "play") return coopStep(state, FlashpointRescueCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: FlashpointRescueCoopState): { score: number } | null {
  const r = coopScore(state, FlashpointRescueCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = FlashpointRescueCoop_CFG.totalRounds;
export const TARGET_SCORE = FlashpointRescueCoop_CFG.progressTarget;
export const FLAVOR = "Drop fire, drag people to safety.";
