import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WretchedZombieSettings { dummy: boolean; }
export interface WretchedZombieState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WretchedZombieAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Day 1. The radio is finally silent.", choices: ["Pack the radio","Smash it for parts","Leave a final message","Listen one last time"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "A pharmacy still stands, with a window broken.", choices: ["Slip in quietly","Knock first","Watch from across","Skip it entirely"] as [string,string,string,string], weights: [16,6,14,8] as [number,number,number,number] },
  { prompt: "A child's voice cries from a closet.", choices: ["Open the closet","Lock the door instead","Slide food under","Whisper hope, leave"] as [string,string,string,string], weights: [16,4,14,12] as [number,number,number,number] },
  { prompt: "Your knife dulls fast tonight.", choices: ["Sharpen on stone","Find a new blade","Tape it for grip","Switch to crowbar"] as [string,string,string,string], weights: [14,12,10,16] as [number,number,number,number] },
  { prompt: "The dead at the fence are familiar.", choices: ["Recognize and weep","Fire from height","Lure them away","Cover and refuse"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "A stranger asks to share your fire.", choices: ["Welcome with caution","Refuse politely","Demand they disarm","Vanish into woods"] as [string,string,string,string], weights: [16,10,14,8] as [number,number,number,number] },
  { prompt: "Your shoes are about to fail.", choices: ["Take dead's shoes","Tape and ration","Search a sports store","Walk barefoot a day"] as [string,string,string,string], weights: [12,14,16,6] as [number,number,number,number] },
  { prompt: "An attic holds family photos.", choices: ["Take none, weep","Take one to keep","Burn for warmth","Leave a note pinned"] as [string,string,string,string], weights: [16,14,8,14] as [number,number,number,number] },
  { prompt: "A horde has shifted toward your camp.", choices: ["Pack and move","Stand ground","Set fire as decoy","Climb to silence"] as [string,string,string,string], weights: [16,6,14,14] as [number,number,number,number] },
  { prompt: "Final entry. What is your last note?", choices: ["I am alive today","I forgive everyone","I tried","Find my child"] as [string,string,string,string], weights: [14,14,16,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: WretchedZombieSettings): WretchedZombieState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WretchedZombieState, action: WretchedZombieAction): WretchedZombieState {
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
export function isTerminal(state: WretchedZombieState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
