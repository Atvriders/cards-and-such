import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const OneDeckGalaxy_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Tiny Galaxy",
  "scenarioEmoji": "🌌",
  "progressLabel": "Glory",
  "threatLabel": "Encroachment",
  "moraleLabel": "Resources",
  "tactics": [
    {
      "id": "explore",
      "label": "Explore",
      "emoji": "🚀",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "New world."
    },
    {
      "id": "expand",
      "label": "Expand",
      "emoji": "🪐",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Colony."
    },
    {
      "id": "research",
      "label": "Research",
      "emoji": "🔬",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Tech."
    },
    {
      "id": "defend",
      "label": "Defend",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Border."
    }
  ]
};

export interface OneDeckGalaxySettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type OneDeckGalaxyState = CoopState;
export type OneDeckGalaxyAction = { type: "play"; tacticId: string };

function diffNum(s: OneDeckGalaxySettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: OneDeckGalaxySettings): OneDeckGalaxyState {
  return coopInitial(seed, OneDeckGalaxy_CFG, diffNum(s));
}

export function reducer(state: OneDeckGalaxyState, action: OneDeckGalaxyAction): OneDeckGalaxyState {
  if (action.type === "play") return coopStep(state, OneDeckGalaxy_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: OneDeckGalaxyState): { score: number } | null {
  const r = coopScore(state, OneDeckGalaxy_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = OneDeckGalaxy_CFG.totalRounds;
export const TARGET_SCORE = OneDeckGalaxy_CFG.progressTarget;
export const FLAVOR = "Tiny but tense space empire.";
