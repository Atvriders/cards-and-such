import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MarvelChampionsCoop_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 60,
  "threatPerRound": 3,
  "startMorale": 5,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Villain Schemes",
  "scenarioEmoji": "🦸",
  "progressLabel": "Damage",
  "threatLabel": "Scheme",
  "moraleLabel": "Hero HP",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "💥",
      "effort": 6,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Big damage."
    },
    {
      "id": "thwart",
      "label": "Thwart",
      "emoji": "🛡️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 2,
      "desc": "Reduce scheme."
    },
    {
      "id": "recover",
      "label": "Recover",
      "emoji": "💖",
      "effort": 3,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Heal."
    },
    {
      "id": "setup",
      "label": "Set Up",
      "emoji": "🃏",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Resources."
    }
  ]
};

export interface MarvelChampionsCoopSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MarvelChampionsCoopState = CoopState;
export type MarvelChampionsCoopAction = { type: "play"; tacticId: string };

function diffNum(s: MarvelChampionsCoopSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MarvelChampionsCoopSettings): MarvelChampionsCoopState {
  return coopInitial(seed, MarvelChampionsCoop_CFG, diffNum(s));
}

export function reducer(state: MarvelChampionsCoopState, action: MarvelChampionsCoopAction): MarvelChampionsCoopState {
  if (action.type === "play") return coopStep(state, MarvelChampionsCoop_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MarvelChampionsCoopState): { score: number } | null {
  const r = coopScore(state, MarvelChampionsCoop_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MarvelChampionsCoop_CFG.totalRounds;
export const TARGET_SCORE = MarvelChampionsCoop_CFG.progressTarget;
export const FLAVOR = "Switch hero/alter-ego; thwart villain schemes.";
