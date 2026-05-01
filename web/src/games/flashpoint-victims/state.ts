import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const FlashpointVictims_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Many Trapped",
  "scenarioEmoji": "🆘",
  "progressLabel": "Saved",
  "threatLabel": "Fire",
  "moraleLabel": "Damage",
  "tactics": [
    {
      "id": "rescue",
      "label": "Rescue",
      "emoji": "🆘",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Carry."
    },
    {
      "id": "hose",
      "label": "Hose",
      "emoji": "💦",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 2,
      "desc": "Fight fire."
    },
    {
      "id": "medic",
      "label": "Medic",
      "emoji": "💊",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Heal."
    },
    {
      "id": "chop",
      "label": "Chop",
      "emoji": "🪓",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Open."
    }
  ]
};

export interface FlashpointVictimsSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type FlashpointVictimsState = CoopState;
export type FlashpointVictimsAction = { type: "play"; tacticId: string };

function diffNum(s: FlashpointVictimsSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: FlashpointVictimsSettings): FlashpointVictimsState {
  return coopInitial(seed, FlashpointVictims_CFG, diffNum(s));
}

export function reducer(state: FlashpointVictimsState, action: FlashpointVictimsAction): FlashpointVictimsState {
  if (action.type === "play") return coopStep(state, FlashpointVictims_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: FlashpointVictimsState): { score: number } | null {
  const r = coopScore(state, FlashpointVictims_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = FlashpointVictims_CFG.totalRounds;
export const TARGET_SCORE = FlashpointVictims_CFG.progressTarget;
export const FLAVOR = "Many victims, one truck.";
