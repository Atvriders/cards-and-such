import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ClankInSpace_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Lord Eradikus' Ship",
  "scenarioEmoji": "🚀",
  "progressLabel": "Loot",
  "threatLabel": "Clank",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "acquire",
      "label": "Acquire Card",
      "emoji": "🛒",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Buy upgrade."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "⚔️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Fight."
    },
    {
      "id": "loot",
      "label": "Loot",
      "emoji": "💎",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Grab artifact."
    },
    {
      "id": "hide",
      "label": "Hide",
      "emoji": "🌫️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Reduce clank."
    }
  ]
};

export interface ClankInSpaceSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ClankInSpaceState = CoopState;
export type ClankInSpaceAction = { type: "play"; tacticId: string };

function diffNum(s: ClankInSpaceSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ClankInSpaceSettings): ClankInSpaceState {
  return coopInitial(seed, ClankInSpace_CFG, diffNum(s));
}

export function reducer(state: ClankInSpaceState, action: ClankInSpaceAction): ClankInSpaceState {
  if (action.type === "play") return coopStep(state, ClankInSpace_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ClankInSpaceState): { score: number } | null {
  const r = coopScore(state, ClankInSpace_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ClankInSpace_CFG.totalRounds;
export const TARGET_SCORE = ClankInSpace_CFG.progressTarget;
export const FLAVOR = "Deckbuild while sneaking through Lord Eradikus' ship.";
