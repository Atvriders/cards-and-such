import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface QuillGothicLettersSettings { dummy: boolean; }
export interface QuillGothicLettersState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type QuillGothicLettersAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Open: Dearest Margaret. The wallpaper changed again.", choices: ["Be reassuring","Be alarmed","Be cryptic","Be confessional"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] },
  { prompt: "Describe the manor's east hall.", choices: ["Cold but quiet","Warm and watching","Empty in daytime","Full at midnight"] as [string,string,string,string], weights: [12,16,14,14] as [number,number,number,number] },
  { prompt: "Mention the guest who arrived in storm.", choices: ["He brings news","She brings warning","They bring nothing","They bring envelope"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "Address the inheritance question.", choices: ["I refuse it","I accept conditionally","I have not decided","It refuses me"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "Speak of the cellar door.", choices: ["I will not open it","I have opened it","It opened itself","It awaits your visit"] as [string,string,string,string], weights: [14,16,12,10] as [number,number,number,number] },
  { prompt: "Inquire after a friend's health.", choices: ["With genuine warmth","With urgent worry","With cool politeness","With unspoken fear"] as [string,string,string,string], weights: [16,14,8,12] as [number,number,number,number] },
  { prompt: "Mention the strange book again.", choices: ["I have closed it","I have copied a page","I have lost it","It has lost me"] as [string,string,string,string], weights: [14,16,10,14] as [number,number,number,number] },
  { prompt: "Describe the night you do not remember.", choices: ["With absences","With blanks","With substitutions","With another's name"] as [string,string,string,string], weights: [14,14,12,16] as [number,number,number,number] },
  { prompt: "Offer a small gift in the envelope.", choices: ["A pressed flower","A lock of hair","A blank page","A copper coin"] as [string,string,string,string], weights: [16,14,14,10] as [number,number,number,number] },
  { prompt: "Sign the letter.", choices: ["Yours, in faith","Yours, until dawn","Yours, no longer sure","Unsigned"] as [string,string,string,string], weights: [14,14,16,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: QuillGothicLettersSettings): QuillGothicLettersState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: QuillGothicLettersState, action: QuillGothicLettersAction): QuillGothicLettersState {
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
export function isTerminal(state: QuillGothicLettersState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
