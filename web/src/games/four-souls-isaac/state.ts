import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const FourSoulsIsaac_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Basement Run",
  "scenarioEmoji": "👁️",
  "progressLabel": "Souls",
  "threatLabel": "Curses",
  "moraleLabel": "HP",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "⚔️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Fight."
    },
    {
      "id": "loot",
      "label": "Loot",
      "emoji": "💎",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Item."
    },
    {
      "id": "buy",
      "label": "Buy",
      "emoji": "🪙",
      "effort": 3,
      "reliability": 0.9,
      "threatPush": 0,
      "desc": "Shop."
    },
    {
      "id": "pray",
      "label": "Pray",
      "emoji": "🙏",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    }
  ]
};

export interface FourSoulsIsaacSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type FourSoulsIsaacState = CoopState;
export type FourSoulsIsaacAction = { type: "play"; tacticId: string };

function diffNum(s: FourSoulsIsaacSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: FourSoulsIsaacSettings): FourSoulsIsaacState {
  return coopInitial(seed, FourSoulsIsaac_CFG, diffNum(s));
}

export function reducer(state: FourSoulsIsaacState, action: FourSoulsIsaacAction): FourSoulsIsaacState {
  if (action.type === "play") return coopStep(state, FourSoulsIsaac_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: FourSoulsIsaacState): { score: number } | null {
  const r = coopScore(state, FourSoulsIsaac_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = FourSoulsIsaac_CFG.totalRounds;
export const TARGET_SCORE = FourSoulsIsaac_CFG.progressTarget;
export const FLAVOR = "Defeat monsters; collect 4 souls.";
