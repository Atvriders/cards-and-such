import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ArtefactHistorySettings { dummy: boolean; }
export interface ArtefactHistoryState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ArtefactHistoryAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "First forging. What was the metal?", choices: ["Meteoric iron","Stolen gold","Sea-bone bronze","Tear-glazed glass"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "First bearer's first deed.", choices: ["Saved a city","Founded a line","Slew a brother","Healed a queen"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "Lost for a generation. Where?", choices: ["At the bottom of a well","Inside a temple wall","Buried with a child","On a battlefield"] as [string,string,string,string], weights: [12,14,16,12] as [number,number,number,number] },
  { prompt: "Found again by whom?", choices: ["A scholar","A widow","A thief","A child"] as [string,string,string,string], weights: [12,14,12,16] as [number,number,number,number] },
  { prompt: "A king buys it for ransom.", choices: ["Pays in gold","Pays in lives","Pays in promises","Refuses, takes it"] as [string,string,string,string], weights: [12,14,10,8] as [number,number,number,number] },
  { prompt: "It survives a fire.", choices: ["Glows brighter after","Bears scorch marks","Loses its shine","Whispers thereafter"] as [string,string,string,string], weights: [14,12,10,16] as [number,number,number,number] },
  { prompt: "A hidden inscription is read.", choices: ["A blessing in old script","A curse in newer script","A name no longer known","A list of seven cities"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] },
  { prompt: "It travels overseas.", choices: ["Sealed in a chest","Worn by an envoy","Smuggled in cloth","Lost in the storm"] as [string,string,string,string], weights: [12,14,16,8] as [number,number,number,number] },
  { prompt: "It enters a museum.", choices: ["Behind glass forever","Stolen within a year","Mislabeled wrongly","Returned to its land"] as [string,string,string,string], weights: [10,14,12,16] as [number,number,number,number] },
  { prompt: "Final entry. Who holds it now?", choices: ["A historian","A child playing","Nobody, lost","Me, writing this"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ArtefactHistorySettings): ArtefactHistoryState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ArtefactHistoryState, action: ArtefactHistoryAction): ArtefactHistoryState {
  if (state.phase === "done") return state;
  if (action.type === "choose") {
    if (state.phase !== "choose") return state;
    const p = state.prompts[state.index]!;
    const baseW = p.weights[action.choice]!;
    const rng = mulberry32(state.rngSeed);
    const variance = Math.floor(rng() * 21);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = baseW + variance;
    return { ...state, rngSeed: nextSeed, selected: action.choice, lastPts: pts, score: state.score + pts, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const ni = state.index + 1;
    if (ni >= state.prompts.length) return { ...state, phase: "done" };
    return { ...state, index: ni, selected: null, lastPts: 0, phase: "choose" };
  }
  return state;
}
export function isTerminal(state: ArtefactHistoryState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
