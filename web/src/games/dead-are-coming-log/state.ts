import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface DeadAreComingLogSettings { dummy: boolean; }
export interface DeadAreComingLogState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type DeadAreComingLogAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Day 1 of the new community charter.", choices: ["Vote in a council","Anoint one leader","Rotate every dawn","Refuse leadership"] as [string,string,string,string], weights: [14,12,16,8] as [number,number,number,number] },
  { prompt: "The water tower has cracked overnight.", choices: ["Patch with bicycle tube","Move to spring","Boil river water","Ration to half cup"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "A scavenger comes back wounded.", choices: ["Quarantine quickly","Patch and trust","Send out alone","Tend until clear"] as [string,string,string,string], weights: [16,8,6,14] as [number,number,number,number] },
  { prompt: "A child cries every night for a parent.", choices: ["Hold them through it","Make a memory book","Give them a chore","Write to the parent"] as [string,string,string,string], weights: [16,14,10,12] as [number,number,number,number] },
  { prompt: "Strangers ask to join the community.", choices: ["Welcome with watch","Demand a trade","Refuse politely","Walk them to next camp"] as [string,string,string,string], weights: [16,10,8,14] as [number,number,number,number] },
  { prompt: "An elder's heart begins to fail.", choices: ["Ease the pain only","Try every herb","Record their stories","Hold their hand alone"] as [string,string,string,string], weights: [12,8,16,14] as [number,number,number,number] },
  { prompt: "The dead approach in numbers.", choices: ["Bar the gate","Lure away with fire","Climb to high roof","Defend in the open"] as [string,string,string,string], weights: [16,14,12,6] as [number,number,number,number] },
  { prompt: "Food runs low in the second winter.", choices: ["Hunt the lean game","Forage frozen turnip","Cut rations equally","Trade tools for grain"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "A festival is proposed for the solstice.", choices: ["Light every lantern","Quiet meal only","Dance until dawn","Read names of the lost"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "Final log. What is the community's name?", choices: ["Hope, plainly","Their names, joined","A lost river","No name at all"] as [string,string,string,string], weights: [12,16,14,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: DeadAreComingLogSettings): DeadAreComingLogState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: DeadAreComingLogState, action: DeadAreComingLogAction): DeadAreComingLogState {
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
export function isTerminal(state: DeadAreComingLogState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
