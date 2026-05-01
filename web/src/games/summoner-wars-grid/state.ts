import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SummonerWarsGrid_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Battlefield",
  "scenarioEmoji": "♟️",
  "progressLabel": "Summoner Damage",
  "threatLabel": "Enemy Units",
  "moraleLabel": "Magic",
  "tactics": [
    {
      "id": "summon",
      "label": "Summon",
      "emoji": "✨",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Bring unit."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "⚔️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "move",
      "label": "Maneuver",
      "emoji": "➡️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Reposition."
    },
    {
      "id": "magic",
      "label": "Recharge",
      "emoji": "🔋",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Magic."
    }
  ]
};

export interface SummonerWarsGridSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SummonerWarsGridState = CoopState;
export type SummonerWarsGridAction = { type: "play"; tacticId: string };

function diffNum(s: SummonerWarsGridSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SummonerWarsGridSettings): SummonerWarsGridState {
  return coopInitial(seed, SummonerWarsGrid_CFG, diffNum(s));
}

export function reducer(state: SummonerWarsGridState, action: SummonerWarsGridAction): SummonerWarsGridState {
  if (action.type === "play") return coopStep(state, SummonerWarsGrid_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SummonerWarsGridState): { score: number } | null {
  const r = coopScore(state, SummonerWarsGrid_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SummonerWarsGrid_CFG.totalRounds;
export const TARGET_SCORE = SummonerWarsGrid_CFG.progressTarget;
export const FLAVOR = "Position units; KO the enemy summoner.";
