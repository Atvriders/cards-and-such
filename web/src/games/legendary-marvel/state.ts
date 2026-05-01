import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const LegendaryMarvel_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 65,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Mastermind Plot",
  "scenarioEmoji": "🦸",
  "progressLabel": "Damage",
  "threatLabel": "Scheme Twist",
  "moraleLabel": "City",
  "tactics": [
    {
      "id": "recruit",
      "label": "Recruit",
      "emoji": "🤝",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Hero."
    },
    {
      "id": "attack",
      "label": "Attack",
      "emoji": "💥",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 1,
      "desc": "Villain."
    },
    {
      "id": "master",
      "label": "Hit Mastermind",
      "emoji": "🎯",
      "effort": 6,
      "reliability": 0.5,
      "threatPush": 2,
      "desc": "Major progress."
    },
    {
      "id": "heal",
      "label": "Heal",
      "emoji": "💖",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "City."
    }
  ]
};

export interface LegendaryMarvelSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type LegendaryMarvelState = CoopState;
export type LegendaryMarvelAction = { type: "play"; tacticId: string };

function diffNum(s: LegendaryMarvelSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: LegendaryMarvelSettings): LegendaryMarvelState {
  return coopInitial(seed, LegendaryMarvel_CFG, diffNum(s));
}

export function reducer(state: LegendaryMarvelState, action: LegendaryMarvelAction): LegendaryMarvelState {
  if (action.type === "play") return coopStep(state, LegendaryMarvel_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: LegendaryMarvelState): { score: number } | null {
  const r = coopScore(state, LegendaryMarvel_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = LegendaryMarvel_CFG.totalRounds;
export const TARGET_SCORE = LegendaryMarvel_CFG.progressTarget;
export const FLAVOR = "Recruit heroes; defeat villains and Mastermind.";
