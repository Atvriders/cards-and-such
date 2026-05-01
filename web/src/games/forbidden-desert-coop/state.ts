import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ForbiddenDesertCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Storm-Buried Tomb",
  "scenarioEmoji": "🏜️",
  "progressLabel": "Parts",
  "threatLabel": "Sandstorm",
  "moraleLabel": "Water",
  "tactics": [
    {
      "id": "excavate",
      "label": "Excavate",
      "emoji": "🪣",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Clear sand."
    },
    {
      "id": "part",
      "label": "Find Part",
      "emoji": "⚙️",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Locate fragment."
    },
    {
      "id": "water",
      "label": "Drink Water",
      "emoji": "💧",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Replenish."
    },
    {
      "id": "move",
      "label": "Move",
      "emoji": "🐫",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Travel."
    }
  ]
};

export interface ForbiddenDesertCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ForbiddenDesertCoopState = CoopState;
export type ForbiddenDesertCoopAction = { type: "play"; tacticId: string };

function diffNum(s: ForbiddenDesertCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ForbiddenDesertCoopSettings): ForbiddenDesertCoopState {
  return coopInitial(seed, ForbiddenDesertCoop_CFG, diffNum(s));
}

export function reducer(state: ForbiddenDesertCoopState, action: ForbiddenDesertCoopAction): ForbiddenDesertCoopState {
  if (action.type === "play") return coopStep(state, ForbiddenDesertCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ForbiddenDesertCoopState): { score: number } | null {
  const r = coopScore(state, ForbiddenDesertCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ForbiddenDesertCoop_CFG.totalRounds;
export const TARGET_SCORE = ForbiddenDesertCoop_CFG.progressTarget;
export const FLAVOR = "Find four parts of the airship.";
