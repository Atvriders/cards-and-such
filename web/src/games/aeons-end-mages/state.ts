import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const AeonsEndMages_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "The Breach",
  "scenarioEmoji": "🌌",
  "progressLabel": "Damage to Nameless",
  "threatLabel": "Nemesis Power",
  "moraleLabel": "Gravehold",
  "tactics": [
    {
      "id": "cast",
      "label": "Cast Spell",
      "emoji": "✨",
      "effort": 6,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Big damage."
    },
    {
      "id": "prep",
      "label": "Prep Spell",
      "emoji": "🔮",
      "effort": 4,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Steady setup."
    },
    {
      "id": "gem",
      "label": "Gain Gem",
      "emoji": "💎",
      "effort": 3,
      "reliability": 1,
      "threatPush": 0,
      "desc": "Income."
    },
    {
      "id": "focus",
      "label": "Focus Breach",
      "emoji": "🎯",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Speed up."
    }
  ]
};

export interface AeonsEndMagesSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type AeonsEndMagesState = CoopState;
export type AeonsEndMagesAction = { type: "play"; tacticId: string };

function diffNum(s: AeonsEndMagesSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: AeonsEndMagesSettings): AeonsEndMagesState {
  return coopInitial(seed, AeonsEndMages_CFG, diffNum(s));
}

export function reducer(state: AeonsEndMagesState, action: AeonsEndMagesAction): AeonsEndMagesState {
  if (action.type === "play") return coopStep(state, AeonsEndMages_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: AeonsEndMagesState): { score: number } | null {
  const r = coopScore(state, AeonsEndMages_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = AeonsEndMages_CFG.totalRounds;
export const TARGET_SCORE = AeonsEndMages_CFG.progressTarget;
export const FLAVOR = "Prep gems, cast through breaches.";
