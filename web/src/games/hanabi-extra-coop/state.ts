import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const HanabiExtraCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Extra Suit",
  "scenarioEmoji": "🎇",
  "progressLabel": "Fireworks",
  "threatLabel": "Fuse",
  "moraleLabel": "Lives",
  "tactics": [
    {
      "id": "play",
      "label": "Play",
      "emoji": "🎆",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 1,
      "desc": "Firework."
    },
    {
      "id": "hint",
      "label": "Hint",
      "emoji": "💡",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Hint."
    },
    {
      "id": "discard",
      "label": "Discard",
      "emoji": "🗑️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Token."
    },
    {
      "id": "extra",
      "label": "Extra Suit",
      "emoji": "🌈",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Bonus suit."
    }
  ]
};

export interface HanabiExtraCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type HanabiExtraCoopState = CoopState;
export type HanabiExtraCoopAction = { type: "play"; tacticId: string };

function diffNum(s: HanabiExtraCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: HanabiExtraCoopSettings): HanabiExtraCoopState {
  return coopInitial(seed, HanabiExtraCoop_CFG, diffNum(s));
}

export function reducer(state: HanabiExtraCoopState, action: HanabiExtraCoopAction): HanabiExtraCoopState {
  if (action.type === "play") return coopStep(state, HanabiExtraCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: HanabiExtraCoopState): { score: number } | null {
  const r = coopScore(state, HanabiExtraCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = HanabiExtraCoop_CFG.totalRounds;
export const TARGET_SCORE = HanabiExtraCoop_CFG.progressTarget;
export const FLAVOR = "Add a sixth suit for harder play.";
