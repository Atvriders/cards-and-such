import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const CrewQuestPlanet9_CFG: CoopEngineConfig = {
  "totalRounds": 10,
  "progressTarget": 50,
  "threatPerRound": 3,
  "startMorale": 3,
  "threatBreakpoint": 6,
  "allyEffort": 3,
  "allyClutch": 0.4,
  "scenarioLabel": "Mission to Planet Nine",
  "scenarioEmoji": "🪐",
  "progressLabel": "Tasks",
  "threatLabel": "Errors",
  "moraleLabel": "O₂",
  "tactics": [
    {
      "id": "lead",
      "label": "Lead",
      "emoji": "🎴",
      "effort": 5,
      "reliability": 0.8,
      "threatPush": 1,
      "desc": "Win."
    },
    {
      "id": "dump",
      "label": "Dump",
      "emoji": "💧",
      "effort": 3,
      "reliability": 0.95,
      "threatPush": 1,
      "desc": "Lose."
    },
    {
      "id": "signal",
      "label": "Signal",
      "emoji": "📡",
      "effort": 4,
      "reliability": 0.7,
      "threatPush": 1,
      "desc": "Hint."
    },
    {
      "id": "plan",
      "label": "Plan",
      "emoji": "🗒️",
      "effort": 2,
      "reliability": 1,
      "threatPush": 1,
      "desc": "Reorder."
    }
  ]
};

export interface CrewQuestPlanet9Settings { difficulty: "Easy" | "Standard" | "Hard"; }
export type CrewQuestPlanet9State = CoopState;
export type CrewQuestPlanet9Action = { type: "play"; tacticId: string };

function diffNum(s: CrewQuestPlanet9Settings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: CrewQuestPlanet9Settings): CrewQuestPlanet9State {
  return coopInitial(seed, CrewQuestPlanet9_CFG, diffNum(s));
}

export function reducer(state: CrewQuestPlanet9State, action: CrewQuestPlanet9Action): CrewQuestPlanet9State {
  if (action.type === "play") return coopStep(state, CrewQuestPlanet9_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: CrewQuestPlanet9State): { score: number } | null {
  const r = coopScore(state, CrewQuestPlanet9_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = CrewQuestPlanet9_CFG.totalRounds;
export const TARGET_SCORE = CrewQuestPlanet9_CFG.progressTarget;
export const FLAVOR = "Coordinate trick-taking with no chat.";
