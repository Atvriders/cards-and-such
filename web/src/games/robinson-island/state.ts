import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const RobinsonIsland_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 70,
  "threatPerRound": 4,
  "startMorale": 4,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.35,
  "scenarioLabel": "Volcano Island",
  "scenarioEmoji": "🌋",
  "progressLabel": "Goals",
  "threatLabel": "Lava",
  "moraleLabel": "Health",
  "tactics": [
    {
      "id": "build",
      "label": "Build",
      "emoji": "🪵",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Construct."
    },
    {
      "id": "hunt",
      "label": "Hunt",
      "emoji": "🏹",
      "effort": 6,
      "reliability": 0.6,
      "threatPush": 0,
      "desc": "Food."
    },
    {
      "id": "explore",
      "label": "Explore",
      "emoji": "🧭",
      "effort": 4,
      "reliability": 0.85,
      "threatPush": 0,
      "desc": "Reveal."
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

export interface RobinsonIslandSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type RobinsonIslandState = CoopState;
export type RobinsonIslandAction = { type: "play"; tacticId: string };

function diffNum(s: RobinsonIslandSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: RobinsonIslandSettings): RobinsonIslandState {
  return coopInitial(seed, RobinsonIsland_CFG, diffNum(s));
}

export function reducer(state: RobinsonIslandState, action: RobinsonIslandAction): RobinsonIslandState {
  if (action.type === "play") return coopStep(state, RobinsonIsland_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: RobinsonIslandState): { score: number } | null {
  const r = coopScore(state, RobinsonIsland_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = RobinsonIsland_CFG.totalRounds;
export const TARGET_SCORE = RobinsonIsland_CFG.progressTarget;
export const FLAVOR = "Survive volcanic threats.";
