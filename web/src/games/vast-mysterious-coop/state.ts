import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const VastMysteriousCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Mysterious Manor",
  "scenarioEmoji": "🏚️",
  "progressLabel": "Rooms Cleared",
  "threatLabel": "Spirits",
  "moraleLabel": "Sanity",
  "tactics": [
    {
      "id": "explore",
      "label": "Explore",
      "emoji": "🗺️",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "New room."
    },
    {
      "id": "fight",
      "label": "Fight",
      "emoji": "⚔️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Spirit."
    },
    {
      "id": "ritual",
      "label": "Ritual",
      "emoji": "🕯️",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Cleanse."
    },
    {
      "id": "rest",
      "label": "Rest",
      "emoji": "🛌",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface VastMysteriousCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type VastMysteriousCoopState = CoopState;
export type VastMysteriousCoopAction = { type: "play"; tacticId: string };

function diffNum(s: VastMysteriousCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: VastMysteriousCoopSettings): VastMysteriousCoopState {
  return coopInitial(seed, VastMysteriousCoop_CFG, diffNum(s));
}

export function reducer(state: VastMysteriousCoopState, action: VastMysteriousCoopAction): VastMysteriousCoopState {
  if (action.type === "play") return coopStep(state, VastMysteriousCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: VastMysteriousCoopState): { score: number } | null {
  const r = coopScore(state, VastMysteriousCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = VastMysteriousCoop_CFG.totalRounds;
export const TARGET_SCORE = VastMysteriousCoop_CFG.progressTarget;
export const FLAVOR = "Each role plays differently — coop variant unifies them.";
