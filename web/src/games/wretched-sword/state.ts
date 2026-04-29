import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WretchedSwordSettings { dummy: boolean; }
export interface WretchedSwordState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WretchedSwordAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "The blade is forged. By whom?", choices: ["A widow with grief","A king with greed","A monk with prayer","A god with malice"] as [string,string,string,string], weights: [16,12,10,14] as [number,number,number,number] },
  { prompt: "First wielder, first betrayal.", choices: ["Brother kills brother","Crown kills servant","Wife kills husband","Child runs free"] as [string,string,string,string], weights: [14,12,14,8] as [number,number,number,number] },
  { prompt: "The blade is buried for a century.", choices: ["Beneath an oak","Inside a tomb","At sea floor","In a battlefield"] as [string,string,string,string], weights: [12,14,14,12] as [number,number,number,number] },
  { prompt: "It is unearthed by a wandering child.", choices: ["Who hides it","Who sells it","Who throws it away","Who is consumed"] as [string,string,string,string], weights: [14,12,8,16] as [number,number,number,number] },
  { prompt: "A war is decided by the blade.", choices: ["A king saved","A nation lost","A village spared","A dynasty ended"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "A lover hides the blade in a chest.", choices: ["Drowns chest at sea","Buries chest at dawn","Burns chest entire","Sells chest unknowing"] as [string,string,string,string], weights: [14,12,8,14] as [number,number,number,number] },
  { prompt: "An emperor uses the blade once.", choices: ["For a coronation","For an execution","For a duel","For a sacrifice"] as [string,string,string,string], weights: [10,16,12,14] as [number,number,number,number] },
  { prompt: "The blade is melted, but not destroyed.", choices: ["Reforged darker","Returned to ore","Cast into bell","Cast into nail"] as [string,string,string,string], weights: [14,10,12,16] as [number,number,number,number] },
  { prompt: "A child today picks it up at a market.", choices: ["Their parent stops them","They pocket it","They drop it crying","They show their friend"] as [string,string,string,string], weights: [12,16,12,14] as [number,number,number,number] },
  { prompt: "Final entry. What does the blade want?", choices: ["To be lost again","To be wielded once more","To be remembered","To rust in peace"] as [string,string,string,string], weights: [16,14,14,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: WretchedSwordSettings): WretchedSwordState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WretchedSwordState, action: WretchedSwordAction): WretchedSwordState {
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
export function isTerminal(state: WretchedSwordState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
