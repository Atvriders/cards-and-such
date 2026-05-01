import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const HpDefenceDarkArts_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 5,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "DADA Practical Exam",
  "scenarioEmoji": "🧙",
  "progressLabel": "Defences",
  "threatLabel": "Curses",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "expelliarmus",
      "label": "Expelliarmus",
      "emoji": "🪄",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Disarm."
    },
    {
      "id": "patronus",
      "label": "Patronus",
      "emoji": "🦌",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 2,
      "desc": "Big push."
    },
    {
      "id": "study",
      "label": "Study",
      "emoji": "📖",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Card."
    },
    {
      "id": "shield",
      "label": "Shield",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Block."
    }
  ]
};

export interface HpDefenceDarkArtsSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type HpDefenceDarkArtsState = CoopState;
export type HpDefenceDarkArtsAction = { type: "play"; tacticId: string };

function diffNum(s: HpDefenceDarkArtsSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: HpDefenceDarkArtsSettings): HpDefenceDarkArtsState {
  return coopInitial(seed, HpDefenceDarkArts_CFG, diffNum(s));
}

export function reducer(state: HpDefenceDarkArtsState, action: HpDefenceDarkArtsAction): HpDefenceDarkArtsState {
  if (action.type === "play") return coopStep(state, HpDefenceDarkArts_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: HpDefenceDarkArtsState): { score: number } | null {
  const r = coopScore(state, HpDefenceDarkArts_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = HpDefenceDarkArts_CFG.totalRounds;
export const TARGET_SCORE = HpDefenceDarkArts_CFG.progressTarget;
export const FLAVOR = "Master defensive spells.";
