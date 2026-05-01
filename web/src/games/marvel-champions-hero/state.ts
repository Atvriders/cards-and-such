import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const MarvelChampionsHero_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 65,
  "threatPerRound": 3,
  "startMorale": 5,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Solo Hero Mission",
  "scenarioEmoji": "💢",
  "progressLabel": "Damage",
  "threatLabel": "Scheme",
  "moraleLabel": "HP",
  "tactics": [
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "💥",
      "effort": 6,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Damage."
    },
    {
      "id": "thwart",
      "label": "Thwart",
      "emoji": "🛡️",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 2,
      "desc": "Scheme."
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
      "id": "ready",
      "label": "Ready",
      "emoji": "♻️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Untap."
    }
  ]
};

export interface MarvelChampionsHeroSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type MarvelChampionsHeroState = CoopState;
export type MarvelChampionsHeroAction = { type: "play"; tacticId: string };

function diffNum(s: MarvelChampionsHeroSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: MarvelChampionsHeroSettings): MarvelChampionsHeroState {
  return coopInitial(seed, MarvelChampionsHero_CFG, diffNum(s));
}

export function reducer(state: MarvelChampionsHeroState, action: MarvelChampionsHeroAction): MarvelChampionsHeroState {
  if (action.type === "play") return coopStep(state, MarvelChampionsHero_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: MarvelChampionsHeroState): { score: number } | null {
  const r = coopScore(state, MarvelChampionsHero_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = MarvelChampionsHero_CFG.totalRounds;
export const TARGET_SCORE = MarvelChampionsHero_CFG.progressTarget;
export const FLAVOR = "Solo hero loadout vs. villain.";
