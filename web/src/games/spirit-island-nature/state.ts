import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SpiritIslandNature_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 7,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Wild Reclamation",
  "scenarioEmoji": "🌳",
  "progressLabel": "Fear",
  "threatLabel": "Blight",
  "moraleLabel": "Presence",
  "tactics": [
    {
      "id": "roots",
      "label": "Roots",
      "emoji": "🌳",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 1,
      "desc": "Grasp village."
    },
    {
      "id": "flood",
      "label": "Flood",
      "emoji": "🌊",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Drown towns."
    },
    {
      "id": "grow",
      "label": "Grow",
      "emoji": "🌱",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Expand."
    },
    {
      "id": "guard",
      "label": "Guard",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Protect."
    }
  ]
};

export interface SpiritIslandNatureSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SpiritIslandNatureState = CoopState;
export type SpiritIslandNatureAction = { type: "play"; tacticId: string };

function diffNum(s: SpiritIslandNatureSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SpiritIslandNatureSettings): SpiritIslandNatureState {
  return coopInitial(seed, SpiritIslandNature_CFG, diffNum(s));
}

export function reducer(state: SpiritIslandNatureState, action: SpiritIslandNatureAction): SpiritIslandNatureState {
  if (action.type === "play") return coopStep(state, SpiritIslandNature_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SpiritIslandNatureState): { score: number } | null {
  const r = coopScore(state, SpiritIslandNature_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SpiritIslandNature_CFG.totalRounds;
export const TARGET_SCORE = SpiritIslandNature_CFG.progressTarget;
export const FLAVOR = "Roots strangle; rivers wash away.";
