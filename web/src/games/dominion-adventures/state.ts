import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const DominionAdventures_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Quest Tokens",
  "scenarioEmoji": "🗺️",
  "progressLabel": "VP",
  "threatLabel": "Empty Piles",
  "moraleLabel": "Hand",
  "tactics": [
    {
      "id": "reserve",
      "label": "Reserve",
      "emoji": "🏦",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Set aside."
    },
    {
      "id": "buygold",
      "label": "Gold",
      "emoji": "🪙",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "+money."
    },
    {
      "id": "buyvp",
      "label": "VP",
      "emoji": "👑",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "+score."
    },
    {
      "id": "token",
      "label": "Token",
      "emoji": "🎟️",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Special."
    }
  ]
};

export interface DominionAdventuresSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type DominionAdventuresState = CoopState;
export type DominionAdventuresAction = { type: "play"; tacticId: string };

function diffNum(s: DominionAdventuresSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: DominionAdventuresSettings): DominionAdventuresState {
  return coopInitial(seed, DominionAdventures_CFG, diffNum(s));
}

export function reducer(state: DominionAdventuresState, action: DominionAdventuresAction): DominionAdventuresState {
  if (action.type === "play") return coopStep(state, DominionAdventures_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: DominionAdventuresState): { score: number } | null {
  const r = coopScore(state, DominionAdventures_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = DominionAdventures_CFG.totalRounds;
export const TARGET_SCORE = DominionAdventures_CFG.progressTarget;
export const FLAVOR = "Reserve cards & tokens.";
