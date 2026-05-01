import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const HanabiAvenueBonus_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Bonus Round",
  "scenarioEmoji": "🎆",
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
      "desc": "Light firework."
    },
    {
      "id": "hint",
      "label": "Hint",
      "emoji": "💡",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Give hint."
    },
    {
      "id": "discard",
      "label": "Discard",
      "emoji": "🗑️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Recover token."
    },
    {
      "id": "bonus",
      "label": "Bonus",
      "emoji": "⭐",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Combo."
    }
  ]
};

export interface HanabiAvenueBonusSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type HanabiAvenueBonusState = CoopState;
export type HanabiAvenueBonusAction = { type: "play"; tacticId: string };

function diffNum(s: HanabiAvenueBonusSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: HanabiAvenueBonusSettings): HanabiAvenueBonusState {
  return coopInitial(seed, HanabiAvenueBonus_CFG, diffNum(s));
}

export function reducer(state: HanabiAvenueBonusState, action: HanabiAvenueBonusAction): HanabiAvenueBonusState {
  if (action.type === "play") return coopStep(state, HanabiAvenueBonus_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: HanabiAvenueBonusState): { score: number } | null {
  const r = coopScore(state, HanabiAvenueBonus_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = HanabiAvenueBonus_CFG.totalRounds;
export const TARGET_SCORE = HanabiAvenueBonus_CFG.progressTarget;
export const FLAVOR = "Hanabi with bonus tokens for clean plays.";
