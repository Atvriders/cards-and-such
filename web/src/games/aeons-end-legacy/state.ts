import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const AeonsEndLegacy_CFG: CoopEngineConfig = {
  "totalRounds": 14,
  "progressTarget": 85,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "World of Estoria",
  "scenarioEmoji": "🗺️",
  "progressLabel": "Campaign",
  "threatLabel": "Corruption",
  "moraleLabel": "Gravehold",
  "tactics": [
    {
      "id": "cast",
      "label": "Cast",
      "emoji": "✨",
      "effort": 6,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "prep",
      "label": "Prep",
      "emoji": "🔮",
      "effort": 4,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Set up."
    },
    {
      "id": "recruit",
      "label": "Recruit",
      "emoji": "👥",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "New ally."
    },
    {
      "id": "focus",
      "label": "Focus",
      "emoji": "🎯",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Breach."
    }
  ]
};

export interface AeonsEndLegacySettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type AeonsEndLegacyState = CoopState;
export type AeonsEndLegacyAction = { type: "play"; tacticId: string };

function diffNum(s: AeonsEndLegacySettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: AeonsEndLegacySettings): AeonsEndLegacyState {
  return coopInitial(seed, AeonsEndLegacy_CFG, diffNum(s));
}

export function reducer(state: AeonsEndLegacyState, action: AeonsEndLegacyAction): AeonsEndLegacyState {
  if (action.type === "play") return coopStep(state, AeonsEndLegacy_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: AeonsEndLegacyState): { score: number } | null {
  const r = coopScore(state, AeonsEndLegacy_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = AeonsEndLegacy_CFG.totalRounds;
export const TARGET_SCORE = AeonsEndLegacy_CFG.progressTarget;
export const FLAVOR = "Permanent unlocks shape future games.";
