import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicLegacyS1_CFG: CoopEngineConfig = {
  "totalRounds": 14,
  "progressTarget": 80,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.3,
  "scenarioLabel": "Faded Cities — Year 1",
  "scenarioEmoji": "📜",
  "progressLabel": "Mission Progress",
  "threatLabel": "Faded",
  "moraleLabel": "Funding",
  "tactics": [
    {
      "id": "operate",
      "label": "Operate",
      "emoji": "🏥",
      "effort": 4,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Field operation."
    },
    {
      "id": "research",
      "label": "Research",
      "emoji": "🔬",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Lab gains."
    },
    {
      "id": "relocate",
      "label": "Relocate",
      "emoji": "✈️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 2,
      "desc": "Move to crisis."
    },
    {
      "id": "dispatch",
      "label": "Dispatch",
      "emoji": "🛰️",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Coordinate."
    }
  ]
};

export interface PandemicLegacyS1Settings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicLegacyS1State = CoopState;
export type PandemicLegacyS1Action = { type: "play"; tacticId: string };

function diffNum(s: PandemicLegacyS1Settings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicLegacyS1Settings): PandemicLegacyS1State {
  return coopInitial(seed, PandemicLegacyS1_CFG, diffNum(s));
}

export function reducer(state: PandemicLegacyS1State, action: PandemicLegacyS1Action): PandemicLegacyS1State {
  if (action.type === "play") return coopStep(state, PandemicLegacyS1_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicLegacyS1State): { score: number } | null {
  const r = coopScore(state, PandemicLegacyS1_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicLegacyS1_CFG.totalRounds;
export const TARGET_SCORE = PandemicLegacyS1_CFG.progressTarget;
export const FLAVOR = "Each round you commit a permanent action toward saving the world.";
