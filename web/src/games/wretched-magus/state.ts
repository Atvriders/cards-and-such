import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WretchedMagusSettings { dummy: boolean; }
export interface WretchedMagusState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WretchedMagusAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Your master is gone for the season.", choices: ["Read only as told","Open a forbidden tome","Practice base spells","Tend the garden first"] as [string,string,string,string], weights: [14,12,16,10] as [number,number,number,number] },
  { prompt: "A familiar steals a candle from the altar.", choices: ["Scold and replace","Let it keep the flame","Trade for a feather","Record the omen"] as [string,string,string,string], weights: [10,14,12,16] as [number,number,number,number] },
  { prompt: "A spell of mending burns the cloth.", choices: ["Note the misstep","Try again at once","Consult the index","Hide the evidence"] as [string,string,string,string], weights: [16,12,14,6] as [number,number,number,number] },
  { prompt: "A herb in the garden weeps blood.", choices: ["Harvest carefully","Burn the patch","Record and protect","Replant elsewhere"] as [string,string,string,string], weights: [12,8,16,14] as [number,number,number,number] },
  { prompt: "A rival apprentice visits, smug.", choices: ["Show your best work","Show only flaws","Refuse to receive","Trade a small secret"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "A summoning circle sparks unbidden.", choices: ["Close it at once","Listen to the spark","Step inside briefly","Send the familiar in"] as [string,string,string,string], weights: [14,16,6,8] as [number,number,number,number] },
  { prompt: "A villager begs for a small healing.", choices: ["Try untested spell","Send for master","Use only herbs","Refuse politely"] as [string,string,string,string], weights: [10,12,16,8] as [number,number,number,number] },
  { prompt: "A storm rises while you sleep.", choices: ["Calm with rote spell","Let it pass naturally","Bottle the wind","Sing the storm-song"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] },
  { prompt: "A sigil glows on the floor at dawn.", choices: ["Trace and study","Erase quickly","Photograph in chalk","Sleep on it again"] as [string,string,string,string], weights: [16,8,14,10] as [number,number,number,number] },
  { prompt: "Last entry. What will you confess?", choices: ["Every failure","Every secret victory","Every borrowed text","Nothing at all"] as [string,string,string,string], weights: [16,14,12,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: WretchedMagusSettings): WretchedMagusState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WretchedMagusState, action: WretchedMagusAction): WretchedMagusState {
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
export function isTerminal(state: WretchedMagusState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
