import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface QuillLettersSettings { dummy: boolean; }
export interface QuillLettersState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type QuillLettersAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A letter to a noblewoman you have never met. Opening line?", choices: ["Most gracious lady", "My dear correspondent", "Esteemed companion of the court", "Your humble servant writes"], weights: [14, 12, 16, 10] },
  { prompt: "How will you sign?", choices: ["Yours always", "With deepest regard", "In service forever", "By my own hand and seal"], weights: [12, 14, 12, 16] },
  { prompt: "A small gift accompanies the letter.", choices: ["A pressed flower", "A silver pin", "A poem in own hand", "A book of recipes"], weights: [14, 10, 16, 12] },
  { prompt: "The letter must include news of the war.", choices: ["Soft and reassuring tone", "Honest about the losses", "A sliver of dark humor", "Reference an old prophecy"], weights: [14, 12, 10, 14] },
  { prompt: "A compliment to weave in?", choices: ["About her gardens", "About her wisdom", "About her clear handwriting", "About her library"], weights: [12, 14, 16, 14] },
  { prompt: "A small confession.", choices: ["A childhood memory", "An embarrassing ride mishap", "An admiration unspoken", "An ambition for next year"], weights: [12, 10, 16, 14] },
  { prompt: "Closing paragraph theme.", choices: ["Hope to see her at midwinter", "Promise of a better next letter", "Anecdote about a stray cat", "Riddle for her amusement"], weights: [14, 12, 16, 14] },
  { prompt: "Ink color tonight.", choices: ["Royal blue", "Iron-gall black", "A green from oak galls", "A red unsuitable for nobility"], weights: [12, 14, 16, 8] },
  { prompt: "Postscript? (P.S. line)", choices: ["A jest about the messenger", "A reminder of an old debt", "A wish for fair weather", "Nothing — leave clean"], weights: [12, 10, 16, 14] },
  { prompt: "Sealed with what wax color?", choices: ["The house red", "A fashionable green", "Black for solemnity", "Plain bee-yellow"], weights: [14, 14, 12, 16] },
];
export function initialState(seed: number, _s: QuillLettersSettings): QuillLettersState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: QuillLettersState, action: QuillLettersAction): QuillLettersState {
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
export function isTerminal(state: QuillLettersState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
