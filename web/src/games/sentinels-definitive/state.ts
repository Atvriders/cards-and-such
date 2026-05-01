import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SentinelsDefinitive_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 80,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Definitive Story",
  "scenarioEmoji": "🦸",
  "progressLabel": "Villain HP",
  "threatLabel": "Plot",
  "moraleLabel": "Heroes",
  "tactics": [
    {
      "id": "power",
      "label": "Power",
      "emoji": "⚡",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Hero power."
    },
    {
      "id": "play",
      "label": "Play",
      "emoji": "🃏",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Card."
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

export interface SentinelsDefinitiveSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SentinelsDefinitiveState = CoopState;
export type SentinelsDefinitiveAction = { type: "play"; tacticId: string };

function diffNum(s: SentinelsDefinitiveSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SentinelsDefinitiveSettings): SentinelsDefinitiveState {
  return coopInitial(seed, SentinelsDefinitive_CFG, diffNum(s));
}

export function reducer(state: SentinelsDefinitiveState, action: SentinelsDefinitiveAction): SentinelsDefinitiveState {
  if (action.type === "play") return coopStep(state, SentinelsDefinitive_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SentinelsDefinitiveState): { score: number } | null {
  const r = coopScore(state, SentinelsDefinitive_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SentinelsDefinitive_CFG.totalRounds;
export const TARGET_SCORE = SentinelsDefinitive_CFG.progressTarget;
export const FLAVOR = "Streamlined hero decks.";
