import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WretchedForestSettings { dummy: boolean; }
export interface WretchedForestState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WretchedForestAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Day one alone. Smoke rises east.", choices: ["Walk east at once","Stay in the shelter","Climb a tree to look","Build a fire of your own"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] },
  { prompt: "An owl calls a name you almost remember.", choices: ["Answer the name","Ignore the call","Carve the name in bark","Sleep in tree-roots"] as [string,string,string,string], weights: [10,12,16,14] as [number,number,number,number] },
  { prompt: "The water tastes of iron tonight.", choices: ["Boil thoroughly","Drink anyway","Search for clean spring","Catch rainwater"] as [string,string,string,string], weights: [16,6,14,12] as [number,number,number,number] },
  { prompt: "A path opens that was not there at dawn.", choices: ["Follow with caution","Mark and refuse","Sit and wait","Trace with stones"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "Footprints follow your own.", choices: ["Set a snare","Walk in circles","Backtrack on yours","Climb to high branch"] as [string,string,string,string], weights: [14,16,12,10] as [number,number,number,number] },
  { prompt: "A child's doll lies in a clearing.", choices: ["Bury the doll","Take the doll","Photograph and leave","Set the doll afire"] as [string,string,string,string], weights: [16,8,12,14] as [number,number,number,number] },
  { prompt: "Your fire goes out before dawn.", choices: ["Restart from sparks","Sleep cold","Walk to find heat","Pray quietly"] as [string,string,string,string], weights: [16,8,12,12] as [number,number,number,number] },
  { prompt: "A stag stares without fleeing.", choices: ["Hunt for meat","Bow and back away","Follow the stag","Hold its gaze"] as [string,string,string,string], weights: [10,14,14,16] as [number,number,number,number] },
  { prompt: "The trees lean inward overnight.", choices: ["Move shelter at once","Carve a warding mark","Hold ground stubbornly","Crawl beneath roots"] as [string,string,string,string], weights: [14,16,8,12] as [number,number,number,number] },
  { prompt: "Final entry. What do you carve last?", choices: ["My name","A warning","A map home","A blessing"] as [string,string,string,string], weights: [12,16,14,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: WretchedForestSettings): WretchedForestState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WretchedForestState, action: WretchedForestAction): WretchedForestState {
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
export function isTerminal(state: WretchedForestState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
