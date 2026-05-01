import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicInTheLab_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "CDC Laboratory",
  "scenarioEmoji": "🔬",
  "progressLabel": "Cure progress",
  "threatLabel": "Outbreaks",
  "moraleLabel": "Funding",
  "tactics": [
    {
      "id": "sequence",
      "label": "Sequence",
      "emoji": "🧬",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Big lab progress."
    },
    {
      "id": "treat",
      "label": "Field Treat",
      "emoji": "💉",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Direct treatment."
    },
    {
      "id": "sample",
      "label": "Sample",
      "emoji": "🧪",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Collect sample."
    },
    {
      "id": "publish",
      "label": "Publish Paper",
      "emoji": "📄",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Lock in results."
    }
  ]
};

export interface PandemicInTheLabSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicInTheLabState = CoopState;
export type PandemicInTheLabAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicInTheLabSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicInTheLabSettings): PandemicInTheLabState {
  return coopInitial(seed, PandemicInTheLab_CFG, diffNum(s));
}

export function reducer(state: PandemicInTheLabState, action: PandemicInTheLabAction): PandemicInTheLabState {
  if (action.type === "play") return coopStep(state, PandemicInTheLab_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicInTheLabState): { score: number } | null {
  const r = coopScore(state, PandemicInTheLab_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicInTheLab_CFG.totalRounds;
export const TARGET_SCORE = PandemicInTheLab_CFG.progressTarget;
export const FLAVOR = "Sequence pathogens; field actions still required.";
