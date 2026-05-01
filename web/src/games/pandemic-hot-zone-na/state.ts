import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicHotZoneNa_CFG: CoopEngineConfig = {
  "totalRounds": 8,
  "progressTarget": 45,
  "threatPerRound": 3,
  "startMorale": 2,
  "threatBreakpoint": 5,
  "allyEffort": 4,
  "allyClutch": 0.4,
  "scenarioLabel": "Hot Zone: North America",
  "scenarioEmoji": "🌎",
  "progressLabel": "Cures",
  "threatLabel": "Hotspots",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "treat",
      "label": "Treat",
      "emoji": "💉",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Reduce active cases."
    },
    {
      "id": "cure",
      "label": "Cure",
      "emoji": "🧪",
      "effort": 6,
      "reliability": 0.5,
      "threatPush": 0,
      "desc": "Long-term progress."
    },
    {
      "id": "travel",
      "label": "Travel",
      "emoji": "✈️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 2,
      "desc": "Respond fast."
    },
    {
      "id": "supply",
      "label": "Resupply",
      "emoji": "📦",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Stable gain."
    }
  ]
};

export interface PandemicHotZoneNaSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicHotZoneNaState = CoopState;
export type PandemicHotZoneNaAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicHotZoneNaSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicHotZoneNaSettings): PandemicHotZoneNaState {
  return coopInitial(seed, PandemicHotZoneNa_CFG, diffNum(s));
}

export function reducer(state: PandemicHotZoneNaState, action: PandemicHotZoneNaAction): PandemicHotZoneNaState {
  if (action.type === "play") return coopStep(state, PandemicHotZoneNa_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicHotZoneNaState): { score: number } | null {
  const r = coopScore(state, PandemicHotZoneNa_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicHotZoneNa_CFG.totalRounds;
export const TARGET_SCORE = PandemicHotZoneNa_CFG.progressTarget;
export const FLAVOR = "30-minute Pandemic. Fewer rounds, sharper threat.";
