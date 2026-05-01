import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const EldritchInvestigator_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Ancient One Awakens",
  "scenarioEmoji": "🐙",
  "progressLabel": "Mysteries",
  "threatLabel": "Doom",
  "moraleLabel": "Sanity",
  "tactics": [
    {
      "id": "travel",
      "label": "Travel",
      "emoji": "🚂",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Cross globe."
    },
    {
      "id": "research",
      "label": "Research",
      "emoji": "📜",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Solve."
    },
    {
      "id": "combat",
      "label": "Combat",
      "emoji": "🔫",
      "effort": 5,
      "reliability": 0.65,
      "threatPush": 2,
      "desc": "Battle."
    },
    {
      "id": "rest",
      "label": "Rest",
      "emoji": "🛌",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal sanity."
    }
  ]
};

export interface EldritchInvestigatorSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type EldritchInvestigatorState = CoopState;
export type EldritchInvestigatorAction = { type: "play"; tacticId: string };

function diffNum(s: EldritchInvestigatorSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: EldritchInvestigatorSettings): EldritchInvestigatorState {
  return coopInitial(seed, EldritchInvestigator_CFG, diffNum(s));
}

export function reducer(state: EldritchInvestigatorState, action: EldritchInvestigatorAction): EldritchInvestigatorState {
  if (action.type === "play") return coopStep(state, EldritchInvestigator_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: EldritchInvestigatorState): { score: number } | null {
  const r = coopScore(state, EldritchInvestigator_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = EldritchInvestigator_CFG.totalRounds;
export const TARGET_SCORE = EldritchInvestigator_CFG.progressTarget;
export const FLAVOR = "Solve mysteries before the Ancient One wakes.";
