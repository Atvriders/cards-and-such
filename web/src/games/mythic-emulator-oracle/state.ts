import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface MythicEmulatorOracleSettings { dummy: boolean; }
export interface MythicEmulatorOracleState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type MythicEmulatorOracleAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Ask: is the door locked?", choices: ["Yes, but barely","Yes, ornately","No, but trapped","No, and inviting"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "Ask: is the merchant honest?", choices: ["Yes, deeply","Yes, but desperate","No, but charming","No, dangerously"] as [string,string,string,string], weights: [16,14,12,8] as [number,number,number,number] },
  { prompt: "Ask: is the ally still alive?", choices: ["Yes, badly hurt","Yes, hidden","No, but a clue remains","No, and you knew"] as [string,string,string,string], weights: [16,14,14,10] as [number,number,number,number] },
  { prompt: "Ask: does the king hear my plea?", choices: ["Yes, with tears","Yes, with anger","No, distracted","No, and offended"] as [string,string,string,string], weights: [14,12,14,8] as [number,number,number,number] },
  { prompt: "Ask: is the curse genuine?", choices: ["Yes, ancient","Yes, recent","No, theatrical","No, but believed"] as [string,string,string,string], weights: [16,12,10,14] as [number,number,number,number] },
  { prompt: "Ask: does the storm break tonight?", choices: ["Yes, hard","Yes, briefly","No, holds off","No, but the next does"] as [string,string,string,string], weights: [14,16,10,14] as [number,number,number,number] },
  { prompt: "Ask: is the captain a friend?", choices: ["Yes, openly","Yes, secretly","No, but useful","No, and watching"] as [string,string,string,string], weights: [16,14,14,8] as [number,number,number,number] },
  { prompt: "Ask: did my message arrive?", choices: ["Yes, read","Yes, unread","No, intercepted","No, lost at sea"] as [string,string,string,string], weights: [16,12,8,12] as [number,number,number,number] },
  { prompt: "Ask: is the relic in this temple?", choices: ["Yes, displayed","Yes, hidden","No, but a copy is","No, never was"] as [string,string,string,string], weights: [10,16,14,12] as [number,number,number,number] },
  { prompt: "Ask: do I survive this scene?", choices: ["Yes, transformed","Yes, intact","No, but remembered","No, and forgotten"] as [string,string,string,string], weights: [16,14,14,8] as [number,number,number,number] }
];
export function initialState(seed: number, _s: MythicEmulatorOracleSettings): MythicEmulatorOracleState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: MythicEmulatorOracleState, action: MythicEmulatorOracleAction): MythicEmulatorOracleState {
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
export function isTerminal(state: MythicEmulatorOracleState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
