import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const TashKalarArena_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Mage Arena",
  "scenarioEmoji": "🔯",
  "progressLabel": "Patterns",
  "threatLabel": "Mana Drain",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "summon",
      "label": "Summon",
      "emoji": "🐉",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Big creature."
    },
    {
      "id": "place",
      "label": "Place Stone",
      "emoji": "🟦",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Foundation."
    },
    {
      "id": "flare",
      "label": "Flare",
      "emoji": "🔥",
      "effort": 3,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Bonus."
    },
    {
      "id": "focus",
      "label": "Focus",
      "emoji": "🎯",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Special."
    }
  ]
};

export interface TashKalarArenaSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type TashKalarArenaState = CoopState;
export type TashKalarArenaAction = { type: "play"; tacticId: string };

function diffNum(s: TashKalarArenaSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: TashKalarArenaSettings): TashKalarArenaState {
  return coopInitial(seed, TashKalarArena_CFG, diffNum(s));
}

export function reducer(state: TashKalarArenaState, action: TashKalarArenaAction): TashKalarArenaState {
  if (action.type === "play") return coopStep(state, TashKalarArena_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: TashKalarArenaState): { score: number } | null {
  const r = coopScore(state, TashKalarArena_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = TashKalarArena_CFG.totalRounds;
export const TARGET_SCORE = TashKalarArena_CFG.progressTarget;
export const FLAVOR = "Place stones in patterns; summon beings.";
