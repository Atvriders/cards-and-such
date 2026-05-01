import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicFallOfRome_CFG: CoopEngineConfig = {
  "totalRounds": 12,
  "progressTarget": 65,
  "threatPerRound": 4,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.3,
  "scenarioLabel": "Barbarians at the Gates",
  "scenarioEmoji": "🏛️",
  "progressLabel": "Alliances",
  "threatLabel": "Invasions",
  "moraleLabel": "Cities held",
  "tactics": [
    {
      "id": "battle",
      "label": "Battle",
      "emoji": "⚔️",
      "effort": 5,
      "reliability": 0.7,
      "threatPush": 2,
      "desc": "Engage barbarians directly."
    },
    {
      "id": "forge",
      "label": "Forge Alliance",
      "emoji": "🤝",
      "effort": 6,
      "reliability": 0.55,
      "threatPush": 0,
      "desc": "Convert a tribe."
    },
    {
      "id": "march",
      "label": "March Legion",
      "emoji": "🛡️",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 2,
      "desc": "Reposition troops."
    },
    {
      "id": "fort",
      "label": "Fortify",
      "emoji": "🏰",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Defensive gain."
    }
  ]
};

export interface PandemicFallOfRomeSettings { difficulty: "Easy" | "Standard" | "Hard"; }
export type PandemicFallOfRomeState = CoopState;
export type PandemicFallOfRomeAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicFallOfRomeSettings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: PandemicFallOfRomeSettings): PandemicFallOfRomeState {
  return coopInitial(seed, PandemicFallOfRome_CFG, diffNum(s));
}

export function reducer(state: PandemicFallOfRomeState, action: PandemicFallOfRomeAction): PandemicFallOfRomeState {
  if (action.type === "play") return coopStep(state, PandemicFallOfRome_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicFallOfRomeState): { score: number } | null {
  const r = coopScore(state, PandemicFallOfRome_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicFallOfRome_CFG.totalRounds;
export const TARGET_SCORE = PandemicFallOfRome_CFG.progressTarget;
export const FLAVOR = "Forge alliances before tribes sack Rome.";
