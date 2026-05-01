import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const AeonsEndCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Gravehold Defense",
  "scenarioEmoji": "🌑",
  "progressLabel": "Nemesis HP",
  "threatLabel": "Tokens",
  "moraleLabel": "Gravehold",
  "tactics": [
    {
      "id": "cast",
      "label": "Cast",
      "emoji": "✨",
      "effort": 6,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "prep",
      "label": "Prep",
      "emoji": "🔮",
      "effort": 4,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Set up."
    },
    {
      "id": "gem",
      "label": "Gem",
      "emoji": "💎",
      "effort": 3,
      "reliability": 1,
      "threatPush": 0,
      "desc": "Charge."
    },
    {
      "id": "crystal",
      "label": "Focus",
      "emoji": "🎯",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Open breach."
    }
  ]
};

export interface AeonsEndCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type AeonsEndCoopState = CoopState;
export type AeonsEndCoopAction = { type: "play"; tacticId: string };

function diffNum(s: AeonsEndCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: AeonsEndCoopSettings): AeonsEndCoopState {
  return coopInitial(seed, AeonsEndCoop_CFG, diffNum(s));
}

export function reducer(state: AeonsEndCoopState, action: AeonsEndCoopAction): AeonsEndCoopState {
  if (action.type === "play") return coopStep(state, AeonsEndCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: AeonsEndCoopState): { score: number } | null {
  const r = coopScore(state, AeonsEndCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = AeonsEndCoop_CFG.totalRounds;
export const TARGET_SCORE = AeonsEndCoop_CFG.progressTarget;
export const FLAVOR = "Coordinate spells with another mage.";
