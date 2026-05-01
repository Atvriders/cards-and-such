import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SentinelsMultiverseCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Villain Plot",
  "scenarioEmoji": "💥",
  "progressLabel": "Villain HP",
  "threatLabel": "Plot",
  "moraleLabel": "Heroes",
  "tactics": [
    {
      "id": "power",
      "label": "Use Power",
      "emoji": "⚡",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Hero power."
    },
    {
      "id": "play",
      "label": "Play Card",
      "emoji": "🃏",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Big effect."
    },
    {
      "id": "draw",
      "label": "Draw",
      "emoji": "📖",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Card."
    },
    {
      "id": "guard",
      "label": "Guard",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Defend."
    }
  ]
};

export interface SentinelsMultiverseCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SentinelsMultiverseCoopState = CoopState;
export type SentinelsMultiverseCoopAction = { type: "play"; tacticId: string };

function diffNum(s: SentinelsMultiverseCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SentinelsMultiverseCoopSettings): SentinelsMultiverseCoopState {
  return coopInitial(seed, SentinelsMultiverseCoop_CFG, diffNum(s));
}

export function reducer(state: SentinelsMultiverseCoopState, action: SentinelsMultiverseCoopAction): SentinelsMultiverseCoopState {
  if (action.type === "play") return coopStep(state, SentinelsMultiverseCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SentinelsMultiverseCoopState): { score: number } | null {
  const r = coopScore(state, SentinelsMultiverseCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SentinelsMultiverseCoop_CFG.totalRounds;
export const TARGET_SCORE = SentinelsMultiverseCoop_CFG.progressTarget;
export const FLAVOR = "Each hero has unique deck and powers.";
