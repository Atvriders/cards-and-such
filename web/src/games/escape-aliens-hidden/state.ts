import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const EscapeAliensHidden_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Ship Evacuation",
  "scenarioEmoji": "👽",
  "progressLabel": "Distance",
  "threatLabel": "Aliens",
  "moraleLabel": "HP",
  "tactics": [
    {
      "id": "sneak",
      "label": "Sneak",
      "emoji": "🤫",
      "effort": 4,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Quiet move."
    },
    {
      "id": "dash",
      "label": "Dash",
      "emoji": "🏃",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Loud but fast."
    },
    {
      "id": "scan",
      "label": "Scan",
      "emoji": "📡",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 1,
      "desc": "Locate alien."
    },
    {
      "id": "trap",
      "label": "Set Trap",
      "emoji": "🪤",
      "effort": 2,
      "reliability": 1,
      "threatPush": 2,
      "desc": "Slow alien."
    }
  ]
};

export interface EscapeAliensHiddenSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type EscapeAliensHiddenState = CoopState;
export type EscapeAliensHiddenAction = { type: "play"; tacticId: string };

function diffNum(s: EscapeAliensHiddenSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: EscapeAliensHiddenSettings): EscapeAliensHiddenState {
  return coopInitial(seed, EscapeAliensHidden_CFG, diffNum(s));
}

export function reducer(state: EscapeAliensHiddenState, action: EscapeAliensHiddenAction): EscapeAliensHiddenState {
  if (action.type === "play") return coopStep(state, EscapeAliensHidden_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: EscapeAliensHiddenState): { score: number } | null {
  const r = coopScore(state, EscapeAliensHidden_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = EscapeAliensHidden_CFG.totalRounds;
export const TARGET_SCORE = EscapeAliensHidden_CFG.progressTarget;
export const FLAVOR = "Move silently; reach an escape pod.";
