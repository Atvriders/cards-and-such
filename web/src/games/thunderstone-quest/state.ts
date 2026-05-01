import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ThunderstoneQuest_CFG: CoopEngineConfig = {
  "totalRounds": 11,
  "progressTarget": 70,
  "threatPerRound": 3,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Dungeon Delve",
  "scenarioEmoji": "🐉",
  "progressLabel": "XP",
  "threatLabel": "Dungeon",
  "moraleLabel": "Hero HP",
  "tactics": [
    {
      "id": "buy",
      "label": "Buy Card",
      "emoji": "🛒",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 0,
      "desc": "Upgrade."
    },
    {
      "id": "dungeon",
      "label": "Raid",
      "emoji": "🗡️",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 1,
      "desc": "Fight monster."
    },
    {
      "id": "village",
      "label": "Village",
      "emoji": "🏘️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 0,
      "desc": "Income."
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

export interface ThunderstoneQuestSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ThunderstoneQuestState = CoopState;
export type ThunderstoneQuestAction = { type: "play"; tacticId: string };

function diffNum(s: ThunderstoneQuestSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ThunderstoneQuestSettings): ThunderstoneQuestState {
  return coopInitial(seed, ThunderstoneQuest_CFG, diffNum(s));
}

export function reducer(state: ThunderstoneQuestState, action: ThunderstoneQuestAction): ThunderstoneQuestState {
  if (action.type === "play") return coopStep(state, ThunderstoneQuest_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ThunderstoneQuestState): { score: number } | null {
  const r = coopScore(state, ThunderstoneQuest_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ThunderstoneQuest_CFG.totalRounds;
export const TARGET_SCORE = ThunderstoneQuest_CFG.progressTarget;
export const FLAVOR = "Buy heroes/items, raid the dungeon.";
