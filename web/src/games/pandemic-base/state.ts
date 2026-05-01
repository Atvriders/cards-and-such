import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const PandemicBase_CFG: CoopEngineConfig = {
  totalRounds: 12,
  progressTarget: 60,
  threatPerRound: 3,
  startMorale: 3,
  threatBreakpoint: 6,
  allyEffort: 3,
  allyClutch: 0.35,
  scenarioLabel: "Disease Outbreak",
  scenarioEmoji: "🦠",
  progressLabel: "Cures",
  threatLabel: "Infections",
  moraleLabel: "Outbreaks left",
  tactics: [
    { id: "treat", label: "Treat Disease", emoji: "💉", effort: 4, reliability: 0.85, threatPush: 1, desc: "Remove cubes in a hot zone." },
    { id: "research", label: "Research Cure", emoji: "🧪", effort: 6, reliability: 0.55, threatPush: 0, desc: "Bank cards toward a cure." },
    { id: "fly", label: "Fly to Hotspot", emoji: "✈️", effort: 3, reliability: 0.95, threatPush: 2, desc: "Reposition for emergency response." },
    { id: "build", label: "Build Station", emoji: "🏥", effort: 2, reliability: 1.0, threatPush: 1, desc: "Foundation for later moves." },
  ],
};

export interface PandemicBaseSettings { difficulty: "Intro" | "Standard" | "Heroic"; }
export type PandemicBaseState = CoopState;
export type PandemicBaseAction = { type: "play"; tacticId: string };

function diffNum(s: PandemicBaseSettings): number {
  if (s.difficulty === "Intro") return 0.7;
  if (s.difficulty === "Heroic") return 1.4;
  return 1.0;
}

export function initialState(seed: number, s: PandemicBaseSettings): PandemicBaseState {
  return coopInitial(seed, PandemicBase_CFG, diffNum(s));
}

export function reducer(state: PandemicBaseState, action: PandemicBaseAction): PandemicBaseState {
  if (action.type === "play") return coopStep(state, PandemicBase_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: PandemicBaseState): { score: number } | null {
  const r = coopScore(state, PandemicBase_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = PandemicBase_CFG.totalRounds;
export const TARGET_SCORE = PandemicBase_CFG.progressTarget;
export const FLAVOR = "Find cures before disease spreads to four cities. Pick a tactic each round.";
