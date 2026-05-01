import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const UndauntedNorthAfrica_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Desert Campaign",
  "scenarioEmoji": "🏜️",
  "progressLabel": "Objectives",
  "threatLabel": "Enemy",
  "moraleLabel": "Morale",
  "tactics": [
    {
      "id": "scout",
      "label": "Scout",
      "emoji": "🔭",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 1,
      "desc": "Recon."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🔫",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Fire."
    },
    {
      "id": "control",
      "label": "Control",
      "emoji": "🚩",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Capture."
    },
    {
      "id": "rally",
      "label": "Rally",
      "emoji": "📣",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Morale."
    }
  ]
};

export interface UndauntedNorthAfricaSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type UndauntedNorthAfricaState = CoopState;
export type UndauntedNorthAfricaAction = { type: "play"; tacticId: string };

function diffNum(s: UndauntedNorthAfricaSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: UndauntedNorthAfricaSettings): UndauntedNorthAfricaState {
  return coopInitial(seed, UndauntedNorthAfrica_CFG, diffNum(s));
}

export function reducer(state: UndauntedNorthAfricaState, action: UndauntedNorthAfricaAction): UndauntedNorthAfricaState {
  if (action.type === "play") return coopStep(state, UndauntedNorthAfrica_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: UndauntedNorthAfricaState): { score: number } | null {
  const r = coopScore(state, UndauntedNorthAfrica_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = UndauntedNorthAfrica_CFG.totalRounds;
export const TARGET_SCORE = UndauntedNorthAfrica_CFG.progressTarget;
export const FLAVOR = "Tanks + infantry across desert.";
