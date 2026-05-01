import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const SentinelsEnvironment_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 75,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Hostile Environment",
  "scenarioEmoji": "🌀",
  "progressLabel": "Villain HP",
  "threatLabel": "Hazards",
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
      "id": "env",
      "label": "Use Environment",
      "emoji": "🌪️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Environmental."
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

export interface SentinelsEnvironmentSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type SentinelsEnvironmentState = CoopState;
export type SentinelsEnvironmentAction = { type: "play"; tacticId: string };

function diffNum(s: SentinelsEnvironmentSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: SentinelsEnvironmentSettings): SentinelsEnvironmentState {
  return coopInitial(seed, SentinelsEnvironment_CFG, diffNum(s));
}

export function reducer(state: SentinelsEnvironmentState, action: SentinelsEnvironmentAction): SentinelsEnvironmentState {
  if (action.type === "play") return coopStep(state, SentinelsEnvironment_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: SentinelsEnvironmentState): { score: number } | null {
  const r = coopScore(state, SentinelsEnvironment_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = SentinelsEnvironment_CFG.totalRounds;
export const TARGET_SCORE = SentinelsEnvironment_CFG.progressTarget;
export const FLAVOR = "Environment threatens both sides.";
