import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const AeonsEndWarEternal_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Eternal War",
  "scenarioEmoji": "⚔️",
  "progressLabel": "Damage",
  "threatLabel": "Nemesis",
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
      "id": "artifact",
      "label": "Artifact",
      "emoji": "🪙",
      "effort": 3,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Effect."
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

export interface AeonsEndWarEternalSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type AeonsEndWarEternalState = CoopState;
export type AeonsEndWarEternalAction = { type: "play"; tacticId: string };

function diffNum(s: AeonsEndWarEternalSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: AeonsEndWarEternalSettings): AeonsEndWarEternalState {
  return coopInitial(seed, AeonsEndWarEternal_CFG, diffNum(s));
}

export function reducer(state: AeonsEndWarEternalState, action: AeonsEndWarEternalAction): AeonsEndWarEternalState {
  if (action.type === "play") return coopStep(state, AeonsEndWarEternal_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: AeonsEndWarEternalState): { score: number } | null {
  const r = coopScore(state, AeonsEndWarEternal_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = AeonsEndWarEternal_CFG.totalRounds;
export const TARGET_SCORE = AeonsEndWarEternal_CFG.progressTarget;
export const FLAVOR = "Dual-class spell loadouts.";
