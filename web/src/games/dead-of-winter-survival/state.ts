import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const DeadOfWinterSurvival_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.3,
  "scenarioLabel": "Crossroads Winter",
  "scenarioEmoji": "🧟",
  "progressLabel": "Crisis Avoided",
  "threatLabel": "Zombies",
  "moraleLabel": "Morale",
  "tactics": [
    {
      "id": "scout",
      "label": "Scout",
      "emoji": "🔭",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Find resources."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🪓",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 2,
      "desc": "Kill zombies."
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
      "id": "stash",
      "label": "Stash",
      "emoji": "📦",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Hoard food."
    }
  ]
};

export interface DeadOfWinterSurvivalSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type DeadOfWinterSurvivalState = CoopState;
export type DeadOfWinterSurvivalAction = { type: "play"; tacticId: string };

function diffNum(s: DeadOfWinterSurvivalSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: DeadOfWinterSurvivalSettings): DeadOfWinterSurvivalState {
  return coopInitial(seed, DeadOfWinterSurvival_CFG, diffNum(s));
}

export function reducer(state: DeadOfWinterSurvivalState, action: DeadOfWinterSurvivalAction): DeadOfWinterSurvivalState {
  if (action.type === "play") return coopStep(state, DeadOfWinterSurvival_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: DeadOfWinterSurvivalState): { score: number } | null {
  const r = coopScore(state, DeadOfWinterSurvival_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = DeadOfWinterSurvival_CFG.totalRounds;
export const TARGET_SCORE = DeadOfWinterSurvival_CFG.progressTarget;
export const FLAVOR = "Find food, fight zombies, manage paranoia.";
