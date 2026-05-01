import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const LotrLcgCoop_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Shadow of Mirkwood",
  "scenarioEmoji": "🧝",
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
      "desc": "Lower threat."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🗡️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Slay enemy."
    },
    {
      "id": "ally",
      "label": "Play Ally",
      "emoji": "🤝",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Reinforcement."
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

export interface LotrLcgCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type LotrLcgCoopState = CoopState;
export type LotrLcgCoopAction = { type: "play"; tacticId: string };

function diffNum(s: LotrLcgCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: LotrLcgCoopSettings): LotrLcgCoopState {
  return coopInitial(seed, LotrLcgCoop_CFG, diffNum(s));
}

export function reducer(state: LotrLcgCoopState, action: LotrLcgCoopAction): LotrLcgCoopState {
  if (action.type === "play") return coopStep(state, LotrLcgCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: LotrLcgCoopState): { score: number } | null {
  const r = coopScore(state, LotrLcgCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = LotrLcgCoop_CFG.totalRounds;
export const TARGET_SCORE = LotrLcgCoop_CFG.progressTarget;
export const FLAVOR = "Quest, fight, and survive Sauron's gaze.";
