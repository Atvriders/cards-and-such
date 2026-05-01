import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ArkhamLcgFellow_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Fellowship Campaign",
  "scenarioEmoji": "📓",
  "progressLabel": "Clues",
  "threatLabel": "Doom",
  "moraleLabel": "Sanity",
  "tactics": [
    {
      "id": "investigate",
      "label": "Investigate",
      "emoji": "🔍",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Clues."
    },
    {
      "id": "fight",
      "label": "Fight",
      "emoji": "⚔️",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "aid",
      "label": "Aid Ally",
      "emoji": "🤝",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Ally helps."
    },
    {
      "id": "rally",
      "label": "Rally",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal sanity."
    }
  ]
};

export interface ArkhamLcgFellowSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ArkhamLcgFellowState = CoopState;
export type ArkhamLcgFellowAction = { type: "play"; tacticId: string };

function diffNum(s: ArkhamLcgFellowSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ArkhamLcgFellowSettings): ArkhamLcgFellowState {
  return coopInitial(seed, ArkhamLcgFellow_CFG, diffNum(s));
}

export function reducer(state: ArkhamLcgFellowState, action: ArkhamLcgFellowAction): ArkhamLcgFellowState {
  if (action.type === "play") return coopStep(state, ArkhamLcgFellow_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ArkhamLcgFellowState): { score: number } | null {
  const r = coopScore(state, ArkhamLcgFellow_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ArkhamLcgFellow_CFG.totalRounds;
export const TARGET_SCORE = ArkhamLcgFellow_CFG.progressTarget;
export const FLAVOR = "Multi-investigator hand pooling.";
