import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface RemnantsFragmentsSettings { dummy: boolean; }
export interface RemnantsFragmentsState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type RemnantsFragmentsAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A pocket watch ticks four hours fast.", choices: ["Trust the watch","Reset the watch","Bury the watch","Carry it as charm"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] },
  { prompt: "A child's drawing names a city.", choices: ["A real city","A misspelled city","An invented city","A city now ruined"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] },
  { prompt: "A song you almost remember.", choices: ["From a parent","From a radio","From a stranger","From a dream"] as [string,string,string,string], weights: [16,14,12,14] as [number,number,number,number] },
  { prompt: "A library card with a name worn off.", choices: ["Names completed in pencil","Names left blank","Names invented","Names burned"] as [string,string,string,string], weights: [16,14,12,8] as [number,number,number,number] },
  { prompt: "A photograph of three smiling figures.", choices: ["Two known, one not","All unknown, named anyway","All unknown, left unnamed","All known, kept safe"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "A government leaflet, half-charred.", choices: ["Trusted in part","Refused entirely","Pinned for record","Burned for warmth"] as [string,string,string,string], weights: [14,8,16,12] as [number,number,number,number] },
  { prompt: "A cassette tape labeled 'For Maria.'", choices: ["Played alone","Played for crowd","Set aside to keep","Recorded over"] as [string,string,string,string], weights: [16,12,14,8] as [number,number,number,number] },
  { prompt: "A garden gnome on a foundation alone.", choices: ["Carried home","Left in place","Added to a shrine","Painted afresh"] as [string,string,string,string], weights: [12,14,16,12] as [number,number,number,number] },
  { prompt: "A diary in a language you mostly know.", choices: ["Translated slowly","Translated quickly","Read in original","Set aside for later"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "Final fragment. What is the last entry you write?", choices: ["A name","A recipe","A goodbye","A beginning"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] }
];
export function initialState(seed: number, _s: RemnantsFragmentsSettings): RemnantsFragmentsState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: RemnantsFragmentsState, action: RemnantsFragmentsAction): RemnantsFragmentsState {
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
export function isTerminal(state: RemnantsFragmentsState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
