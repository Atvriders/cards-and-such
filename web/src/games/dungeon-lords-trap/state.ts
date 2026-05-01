import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const DungeonLordsTrap_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 55,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Evil Dungeon",
  "scenarioEmoji": "💀",
  "progressLabel": "Heroes Defeated",
  "threatLabel": "Audit",
  "moraleLabel": "Reputation",
  "tactics": [
    {
      "id": "trap",
      "label": "Place Trap",
      "emoji": "🪤",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 1,
      "desc": "Big damage."
    },
    {
      "id": "hire",
      "label": "Hire Goblin",
      "emoji": "👹",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Minion."
    },
    {
      "id": "dig",
      "label": "Dig Tunnel",
      "emoji": "⛏️",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Expand."
    },
    {
      "id": "rest",
      "label": "Recover",
      "emoji": "🌙",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Reputation."
    }
  ]
};

export interface DungeonLordsTrapSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type DungeonLordsTrapState = CoopState;
export type DungeonLordsTrapAction = { type: "play"; tacticId: string };

function diffNum(s: DungeonLordsTrapSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: DungeonLordsTrapSettings): DungeonLordsTrapState {
  return coopInitial(seed, DungeonLordsTrap_CFG, diffNum(s));
}

export function reducer(state: DungeonLordsTrapState, action: DungeonLordsTrapAction): DungeonLordsTrapState {
  if (action.type === "play") return coopStep(state, DungeonLordsTrap_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: DungeonLordsTrapState): { score: number } | null {
  const r = coopScore(state, DungeonLordsTrap_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = DungeonLordsTrap_CFG.totalRounds;
export const TARGET_SCORE = DungeonLordsTrap_CFG.progressTarget;
export const FLAVOR = "Be the dungeon-lord; trap parties of heroes.";
