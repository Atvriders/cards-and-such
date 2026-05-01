import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ApothecariaWitch_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Forest Apothecary",
  "scenarioEmoji": "🌿",
  "progressLabel": "Customers Helped",
  "threatLabel": "Plague",
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

export interface ApothecariaWitchSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ApothecariaWitchState = CoopState;
export type ApothecariaWitchAction = { type: "play"; tacticId: string };

function diffNum(s: ApothecariaWitchSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ApothecariaWitchSettings): ApothecariaWitchState {
  return coopInitial(seed, ApothecariaWitch_CFG, diffNum(s));
}

export function reducer(state: ApothecariaWitchState, action: ApothecariaWitchAction): ApothecariaWitchState {
  if (action.type === "play") return coopStep(state, ApothecariaWitch_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ApothecariaWitchState): { score: number } | null {
  const r = coopScore(state, ApothecariaWitch_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ApothecariaWitch_CFG.totalRounds;
export const TARGET_SCORE = ApothecariaWitch_CFG.progressTarget;
export const FLAVOR = "Forage, brew, deliver.";
