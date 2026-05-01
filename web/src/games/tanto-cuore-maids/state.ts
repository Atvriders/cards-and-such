import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const TantoCuoreMaids_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Manor Service",
  "scenarioEmoji": "🎀",
  "progressLabel": "Love",
  "threatLabel": "Bad Habits",
  "moraleLabel": "Manor Order",
  "tactics": [
    {
      "id": "hire",
      "label": "Hire Maid",
      "emoji": "👩",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Recruit."
    },
    {
      "id": "event",
      "label": "Event",
      "emoji": "🎉",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Big effect."
    },
    {
      "id": "clean",
      "label": "Clean",
      "emoji": "🧹",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 2,
      "desc": "Reduce bad habits."
    },
    {
      "id": "rest",
      "label": "Rest",
      "emoji": "💤",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Recover."
    }
  ]
};

export interface TantoCuoreMaidsSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type TantoCuoreMaidsState = CoopState;
export type TantoCuoreMaidsAction = { type: "play"; tacticId: string };

function diffNum(s: TantoCuoreMaidsSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: TantoCuoreMaidsSettings): TantoCuoreMaidsState {
  return coopInitial(seed, TantoCuoreMaids_CFG, diffNum(s));
}

export function reducer(state: TantoCuoreMaidsState, action: TantoCuoreMaidsAction): TantoCuoreMaidsState {
  if (action.type === "play") return coopStep(state, TantoCuoreMaids_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: TantoCuoreMaidsState): { score: number } | null {
  const r = coopScore(state, TantoCuoreMaids_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = TantoCuoreMaids_CFG.totalRounds;
export const TARGET_SCORE = TantoCuoreMaids_CFG.progressTarget;
export const FLAVOR = "Hire maids; manage the manor.";
