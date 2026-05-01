import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const UndauntedNormandy_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "D-Day Beachhead",
  "scenarioEmoji": "🪖",
  "progressLabel": "Objectives",
  "threatLabel": "Enemy Pressure",
  "moraleLabel": "Morale",
  "tactics": [
    {
      "id": "scout",
      "label": "Scout",
      "emoji": "🔭",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Recon."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🔫",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Fire."
    },
    {
      "id": "control",
      "label": "Control",
      "emoji": "🚩",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Capture."
    },
    {
      "id": "rally",
      "label": "Rally",
      "emoji": "📣",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Morale."
    }
  ]
};

export interface UndauntedNormandySettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type UndauntedNormandyState = CoopState;
export type UndauntedNormandyAction = { type: "play"; tacticId: string };

function diffNum(s: UndauntedNormandySettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: UndauntedNormandySettings): UndauntedNormandyState {
  return coopInitial(seed, UndauntedNormandy_CFG, diffNum(s));
}

export function reducer(state: UndauntedNormandyState, action: UndauntedNormandyAction): UndauntedNormandyState {
  if (action.type === "play") return coopStep(state, UndauntedNormandy_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: UndauntedNormandyState): { score: number } | null {
  const r = coopScore(state, UndauntedNormandy_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = UndauntedNormandy_CFG.totalRounds;
export const TARGET_SCORE = UndauntedNormandy_CFG.progressTarget;
export const FLAVOR = "Squad-card deck building.";
