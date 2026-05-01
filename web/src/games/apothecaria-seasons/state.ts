import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ApothecariaSeasons_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Year of Brewing",
  "scenarioEmoji": "🍂",
  "progressLabel": "Customers",
  "threatLabel": "Frost",
  "moraleLabel": "Stamina",
  "tactics": [
    {
      "id": "forage",
      "label": "Forage",
      "emoji": "🌱",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Herbs."
    },
    {
      "id": "brew",
      "label": "Brew",
      "emoji": "🧪",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Potion."
    },
    {
      "id": "deliver",
      "label": "Deliver",
      "emoji": "📬",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Customer."
    },
    {
      "id": "rest",
      "label": "Rest",
      "emoji": "🌙",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Recover."
    }
  ]
};

export interface ApothecariaSeasonsSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ApothecariaSeasonsState = CoopState;
export type ApothecariaSeasonsAction = { type: "play"; tacticId: string };

function diffNum(s: ApothecariaSeasonsSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ApothecariaSeasonsSettings): ApothecariaSeasonsState {
  return coopInitial(seed, ApothecariaSeasons_CFG, diffNum(s));
}

export function reducer(state: ApothecariaSeasonsState, action: ApothecariaSeasonsAction): ApothecariaSeasonsState {
  if (action.type === "play") return coopStep(state, ApothecariaSeasons_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ApothecariaSeasonsState): { score: number } | null {
  const r = coopScore(state, ApothecariaSeasons_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ApothecariaSeasons_CFG.totalRounds;
export const TARGET_SCORE = ApothecariaSeasons_CFG.progressTarget;
export const FLAVOR = "Each season changes available herbs.";
