import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ForTheDramaSettings { dummy: boolean; }
export interface ForTheDramaState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ForTheDramaAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A handwritten letter arrives, perfumed.", choices: ["Read it now","Burn unread","Pass to the matriarch","Hide in your bodice"] as [string,string,string,string], weights: [16,8,6,14] as [number,number,number,number] },
  { prompt: "Your beloved waltzes with a rival.", choices: ["Cut in","Leave the ballroom","Smile and toast","Spike the wine"] as [string,string,string,string], weights: [14,12,16,4] as [number,number,number,number] },
  { prompt: "A maid swears she saw something forbidden.", choices: ["Bribe her silence","Demand details","Tell the patriarch","Pity her"] as [string,string,string,string], weights: [10,14,8,14] as [number,number,number,number] },
  { prompt: "A long-lost twin appears at the gate.", choices: ["Embrace at once","Demand proof","Slam the door","Faint dramatically"] as [string,string,string,string], weights: [16,12,6,14] as [number,number,number,number] },
  { prompt: "The patriarch summons you before midnight.", choices: ["Arrive early","Send a maid first","Refuse the summons","Bring a dagger"] as [string,string,string,string], weights: [14,10,6,12] as [number,number,number,number] },
  { prompt: "Lipstick stains a collar that should not bear it.", choices: ["Wash it secretly","Confront the wearer","Photograph the stain","Wear identical lipstick"] as [string,string,string,string], weights: [8,16,12,14] as [number,number,number,number] },
  { prompt: "A passionate gardener confesses everything.", choices: ["Confess back","Promise nothing","Run away together","Send roses at dawn"] as [string,string,string,string], weights: [14,10,12,16] as [number,number,number,number] },
  { prompt: "The will is read. You are not named.", choices: ["Weep openly","Smile knowingly","Demand an audit","Light a candle alone"] as [string,string,string,string], weights: [12,14,14,12] as [number,number,number,number] },
  { prompt: "An ex-lover shows up uninvited.", choices: ["Dance once","Have them removed","Offer wine, listen","Pretend you forgot them"] as [string,string,string,string], weights: [16,8,14,12] as [number,number,number,number] },
  { prompt: "Final scene. Whose hand spilled the wine?", choices: ["Mine, with reason","Theirs, in jealousy","His, in shame","Hers, in love"] as [string,string,string,string], weights: [16,14,12,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ForTheDramaSettings): ForTheDramaState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ForTheDramaState, action: ForTheDramaAction): ForTheDramaState {
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
export function isTerminal(state: ForTheDramaState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
