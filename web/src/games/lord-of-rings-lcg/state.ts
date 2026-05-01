import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const LordOfRingsLcg_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Across Middle-earth",
  "scenarioEmoji": "🗡️",
  "progressLabel": "Quest",
  "threatLabel": "Shadow",
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
      "desc": "Battle."
    },
    {
      "id": "ally",
      "label": "Ally",
      "emoji": "🤝",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Recruit."
    },
    {
      "id": "heal",
      "label": "Heal",
      "emoji": "💖",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Restore."
    }
  ]
};

export interface LordOfRingsLcgSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type LordOfRingsLcgState = CoopState;
export type LordOfRingsLcgAction = { type: "play"; tacticId: string };

function diffNum(s: LordOfRingsLcgSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: LordOfRingsLcgSettings): LordOfRingsLcgState {
  return coopInitial(seed, LordOfRingsLcg_CFG, diffNum(s));
}

export function reducer(state: LordOfRingsLcgState, action: LordOfRingsLcgAction): LordOfRingsLcgState {
  if (action.type === "play") return coopStep(state, LordOfRingsLcg_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: LordOfRingsLcgState): { score: number } | null {
  const r = coopScore(state, LordOfRingsLcg_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = LordOfRingsLcg_CFG.totalRounds;
export const TARGET_SCORE = LordOfRingsLcg_CFG.progressTarget;
export const FLAVOR = "Take heroes from the Shire to Mordor.";
