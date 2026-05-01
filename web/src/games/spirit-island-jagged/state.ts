import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SpiritIslandJagged_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 65,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 7,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Jagged Earth Awakens",
  "scenarioEmoji": "🌋",
  "progressLabel": "Fear",
  "threatLabel": "Blight",
  "moraleLabel": "Presence",
  "tactics": [
    {
      "id": "erupt",
      "label": "Erupt",
      "emoji": "🌋",
      "effort": 7,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Volcanic devastation."
    },
    {
      "id": "quake",
      "label": "Earthquake",
      "emoji": "💢",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Shake the land."
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
      "id": "defend",
      "label": "Stoneskin",
      "emoji": "🪨",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Protect."
    }
  ]
};

export interface SpiritIslandJaggedSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SpiritIslandJaggedState = CoopState;
export type SpiritIslandJaggedAction = { type: "play"; tacticId: string };

function diffNum(s: SpiritIslandJaggedSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SpiritIslandJaggedSettings): SpiritIslandJaggedState {
  return coopInitial(seed, SpiritIslandJagged_CFG, diffNum(s));
}

export function reducer(state: SpiritIslandJaggedState, action: SpiritIslandJaggedAction): SpiritIslandJaggedState {
  if (action.type === "play") return coopStep(state, SpiritIslandJagged_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SpiritIslandJaggedState): { score: number } | null {
  const r = coopScore(state, SpiritIslandJagged_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SpiritIslandJagged_CFG.totalRounds;
export const TARGET_SCORE = SpiritIslandJagged_CFG.progressTarget;
export const FLAVOR = "Erupt mountains; trap colonists in stone.";
