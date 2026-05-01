import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const HogwartsBattleCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 5,
  "threatBreakpoint": 5,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Years 1–7",
  "scenarioEmoji": "⚡",
  "progressLabel": "Villains Defeated",
  "threatLabel": "Dark Arts",
  "moraleLabel": "Locations",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack Villain",
      "emoji": "💥",
      "effort": 5,
      "reliability": 0.75,
      "threatPush": 1,
      "desc": "Damage villain."
    },
    {
      "id": "acquire",
      "label": "Acquire Spell",
      "emoji": "🪄",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Buy spell."
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

export interface HogwartsBattleCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type HogwartsBattleCoopState = CoopState;
export type HogwartsBattleCoopAction = { type: "play"; tacticId: string };

function diffNum(s: HogwartsBattleCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: HogwartsBattleCoopSettings): HogwartsBattleCoopState {
  return coopInitial(seed, HogwartsBattleCoop_CFG, diffNum(s));
}

export function reducer(state: HogwartsBattleCoopState, action: HogwartsBattleCoopAction): HogwartsBattleCoopState {
  if (action.type === "play") return coopStep(state, HogwartsBattleCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: HogwartsBattleCoopState): { score: number } | null {
  const r = coopScore(state, HogwartsBattleCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = HogwartsBattleCoop_CFG.totalRounds;
export const TARGET_SCORE = HogwartsBattleCoop_CFG.progressTarget;
export const FLAVOR = "Buy spells; KO villains.";
