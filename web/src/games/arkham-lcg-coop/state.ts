import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ArkhamLcgCoop_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Mythos Encroaches",
  "scenarioEmoji": "🔮",
  "progressLabel": "Clues",
  "threatLabel": "Doom",
  "moraleLabel": "Sanity",
  "tactics": [
    {
      "id": "investigate",
      "label": "Investigate",
      "emoji": "🔍",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Gain clues."
    },
    {
      "id": "fight",
      "label": "Fight",
      "emoji": "⚔️",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Damage horror."
    },
    {
      "id": "evade",
      "label": "Evade",
      "emoji": "🏃",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Slip away."
    },
    {
      "id": "commit",
      "label": "Commit Skill",
      "emoji": "💪",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Boost test."
    }
  ]
};

export interface ArkhamLcgCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ArkhamLcgCoopState = CoopState;
export type ArkhamLcgCoopAction = { type: "play"; tacticId: string };

function diffNum(s: ArkhamLcgCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ArkhamLcgCoopSettings): ArkhamLcgCoopState {
  return coopInitial(seed, ArkhamLcgCoop_CFG, diffNum(s));
}

export function reducer(state: ArkhamLcgCoopState, action: ArkhamLcgCoopAction): ArkhamLcgCoopState {
  if (action.type === "play") return coopStep(state, ArkhamLcgCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ArkhamLcgCoopState): { score: number } | null {
  const r = coopScore(state, ArkhamLcgCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ArkhamLcgCoop_CFG.totalRounds;
export const TARGET_SCORE = ArkhamLcgCoop_CFG.progressTarget;
export const FLAVOR = "Investigate, gather clues, fight horrors.";
