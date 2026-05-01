import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const LetterJamCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 2,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Word Puzzle",
  "scenarioEmoji": "🔤",
  "progressLabel": "Letters Deduced",
  "threatLabel": "Tokens Used",
  "moraleLabel": "Hints",
  "tactics": [
    {
      "id": "clue",
      "label": "Give Clue",
      "emoji": "💡",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Word clue."
    },
    {
      "id": "guess",
      "label": "Guess Letter",
      "emoji": "🔡",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Try letter."
    },
    {
      "id": "hint",
      "label": "Use Hint",
      "emoji": "🎯",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Spend token."
    },
    {
      "id": "plan",
      "label": "Plan",
      "emoji": "🗒️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Reorder."
    }
  ]
};

export interface LetterJamCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type LetterJamCoopState = CoopState;
export type LetterJamCoopAction = { type: "play"; tacticId: string };

function diffNum(s: LetterJamCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: LetterJamCoopSettings): LetterJamCoopState {
  return coopInitial(seed, LetterJamCoop_CFG, diffNum(s));
}

export function reducer(state: LetterJamCoopState, action: LetterJamCoopAction): LetterJamCoopState {
  if (action.type === "play") return coopStep(state, LetterJamCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: LetterJamCoopState): { score: number } | null {
  const r = coopScore(state, LetterJamCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = LetterJamCoop_CFG.totalRounds;
export const TARGET_SCORE = LetterJamCoop_CFG.progressTarget;
export const FLAVOR = "Form words; clue your teammate.";
