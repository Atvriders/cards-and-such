import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const DominionIntrigue_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "The Royal Court",
  "scenarioEmoji": "👑",
  "progressLabel": "VP",
  "threatLabel": "Empty Piles",
  "moraleLabel": "Hand Size",
  "tactics": [
    {
      "id": "buyaction",
      "label": "Buy Action",
      "emoji": "🃏",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "+ engine."
    },
    {
      "id": "buygold",
      "label": "Buy Gold",
      "emoji": "🪙",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "+ money."
    },
    {
      "id": "buyvp",
      "label": "Buy VP",
      "emoji": "👑",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "+ score."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "⚔️",
      "effort": 3,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Slow opponent."
    }
  ]
};

export interface DominionIntrigueSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type DominionIntrigueState = CoopState;
export type DominionIntrigueAction = { type: "play"; tacticId: string };

function diffNum(s: DominionIntrigueSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: DominionIntrigueSettings): DominionIntrigueState {
  return coopInitial(seed, DominionIntrigue_CFG, diffNum(s));
}

export function reducer(state: DominionIntrigueState, action: DominionIntrigueAction): DominionIntrigueState {
  if (action.type === "play") return coopStep(state, DominionIntrigue_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: DominionIntrigueState): { score: number } | null {
  const r = coopScore(state, DominionIntrigue_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = DominionIntrigue_CFG.totalRounds;
export const TARGET_SCORE = DominionIntrigue_CFG.progressTarget;
export const FLAVOR = "Buy victory; AI race against you.";
