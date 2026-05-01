import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const GrizzledCoop_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Trench Mission",
  "scenarioEmoji": "🪖",
  "progressLabel": "Missions",
  "threatLabel": "Threats",
  "moraleLabel": "Morale",
  "tactics": [
    {
      "id": "play",
      "label": "Play Card",
      "emoji": "🎴",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Front."
    },
    {
      "id": "withdraw",
      "label": "Withdraw",
      "emoji": "🌙",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Retreat."
    },
    {
      "id": "speech",
      "label": "Speech",
      "emoji": "📣",
      "effort": 4,
      "reliability": 0.75,
      "threatPush": 2,
      "desc": "Morale."
    },
    {
      "id": "share",
      "label": "Share Hardship",
      "emoji": "🤝",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface GrizzledCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type GrizzledCoopState = CoopState;
export type GrizzledCoopAction = { type: "play"; tacticId: string };

function diffNum(s: GrizzledCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: GrizzledCoopSettings): GrizzledCoopState {
  return coopInitial(seed, GrizzledCoop_CFG, diffNum(s));
}

export function reducer(state: GrizzledCoopState, action: GrizzledCoopAction): GrizzledCoopState {
  if (action.type === "play") return coopStep(state, GrizzledCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: GrizzledCoopState): { score: number } | null {
  const r = coopScore(state, GrizzledCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = GrizzledCoop_CFG.totalRounds;
export const TARGET_SCORE = GrizzledCoop_CFG.progressTarget;
export const FLAVOR = "Discard threats; survive the war.";
