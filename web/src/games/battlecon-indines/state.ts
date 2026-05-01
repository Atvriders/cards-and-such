import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const BattleconIndines_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Indines Tournament",
  "scenarioEmoji": "🥊",
  "progressLabel": "Damage",
  "threatLabel": "Counters",
  "moraleLabel": "HP",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "🥊",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Strike."
    },
    {
      "id": "dodge",
      "label": "Dodge",
      "emoji": "💫",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Avoid."
    },
    {
      "id": "special",
      "label": "Special",
      "emoji": "⚡",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Burst."
    },
    {
      "id": "block",
      "label": "Block",
      "emoji": "🛡️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Defend."
    }
  ]
};

export interface BattleconIndinesSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type BattleconIndinesState = CoopState;
export type BattleconIndinesAction = { type: "play"; tacticId: string };

function diffNum(s: BattleconIndinesSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: BattleconIndinesSettings): BattleconIndinesState {
  return coopInitial(seed, BattleconIndines_CFG, diffNum(s));
}

export function reducer(state: BattleconIndinesState, action: BattleconIndinesAction): BattleconIndinesState {
  if (action.type === "play") return coopStep(state, BattleconIndines_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: BattleconIndinesState): { score: number } | null {
  const r = coopScore(state, BattleconIndines_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = BattleconIndines_CFG.totalRounds;
export const TARGET_SCORE = BattleconIndines_CFG.progressTarget;
export const FLAVOR = "Play attack pairs; mind-game opponent.";
