import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SpiritIslandCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 7,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Invader Tide",
  "scenarioEmoji": "🌊",
  "progressLabel": "Fear",
  "threatLabel": "Blight",
  "moraleLabel": "Presence",
  "tactics": [
    {
      "id": "power",
      "label": "Major Power",
      "emoji": "🔥",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 1,
      "desc": "Cast a major spell."
    },
    {
      "id": "minor",
      "label": "Minor Power",
      "emoji": "💨",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Steady fear."
    },
    {
      "id": "growth",
      "label": "Growth",
      "emoji": "🌱",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Expand presence."
    },
    {
      "id": "defend",
      "label": "Defend Land",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Stop blight."
    }
  ]
};

export interface SpiritIslandCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SpiritIslandCoopState = CoopState;
export type SpiritIslandCoopAction = { type: "play"; tacticId: string };

function diffNum(s: SpiritIslandCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SpiritIslandCoopSettings): SpiritIslandCoopState {
  return coopInitial(seed, SpiritIslandCoop_CFG, diffNum(s));
}

export function reducer(state: SpiritIslandCoopState, action: SpiritIslandCoopAction): SpiritIslandCoopState {
  if (action.type === "play") return coopStep(state, SpiritIslandCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SpiritIslandCoopState): { score: number } | null {
  const r = coopScore(state, SpiritIslandCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SpiritIslandCoop_CFG.totalRounds;
export const TARGET_SCORE = SpiritIslandCoop_CFG.progressTarget;
export const FLAVOR = "Generate fear faster than invaders blight the island.";
