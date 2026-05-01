import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const HogwartsVillainCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 5,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Death Eater Onslaught",
  "scenarioEmoji": "🐍",
  "progressLabel": "Villains Down",
  "threatLabel": "Marks",
  "moraleLabel": "Stamina",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "💥",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "buy",
      "label": "Buy Card",
      "emoji": "🪙",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Purchase."
    },
    {
      "id": "influence",
      "label": "Influence",
      "emoji": "🪙",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Money."
    },
    {
      "id": "heal",
      "label": "Heal",
      "emoji": "💖",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Restore."
    }
  ]
};

export interface HogwartsVillainCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type HogwartsVillainCoopState = CoopState;
export type HogwartsVillainCoopAction = { type: "play"; tacticId: string };

function diffNum(s: HogwartsVillainCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: HogwartsVillainCoopSettings): HogwartsVillainCoopState {
  return coopInitial(seed, HogwartsVillainCoop_CFG, diffNum(s));
}

export function reducer(state: HogwartsVillainCoopState, action: HogwartsVillainCoopAction): HogwartsVillainCoopState {
  if (action.type === "play") return coopStep(state, HogwartsVillainCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: HogwartsVillainCoopState): { score: number } | null {
  const r = coopScore(state, HogwartsVillainCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = HogwartsVillainCoop_CFG.totalRounds;
export const TARGET_SCORE = HogwartsVillainCoop_CFG.progressTarget;
export const FLAVOR = "Tougher villains, brutal fights.";
