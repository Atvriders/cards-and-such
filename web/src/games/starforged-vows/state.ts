import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface StarforgedVowsSettings { dummy: boolean; }
export interface StarforgedVowsState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type StarforgedVowsAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A distress beacon pings from a lifeless rock.", choices: ["Investigate immediately","Mark and continue","Hail nearby ships","Record in your log"] as [string,string,string,string], weights: [14,8,12,10] as [number,number,number,number] },
  { prompt: "Your fuel core stutters mid-jump.", choices: ["Realign manually","Drop to sublight","Vent excess plasma","Pray to the Void"] as [string,string,string,string], weights: [16,12,10,6] as [number,number,number,number] },
  { prompt: "A merchant offers you a relic for your vow.", choices: ["Trade the vow","Refuse politely","Steal the relic","Counter-offer service"] as [string,string,string,string], weights: [10,14,8,12] as [number,number,number,number] },
  { prompt: "An ally falls during a raid.", choices: ["Carry them out","Avenge them now","Mark the loss","Promise vengeance later"] as [string,string,string,string], weights: [16,12,8,14] as [number,number,number,number] },
  { prompt: "An oracle whispers from the static.", choices: ["Listen carefully","Block transmission","Record and decode","Reply with vow"] as [string,string,string,string], weights: [14,6,12,10] as [number,number,number,number] },
  { prompt: "You discover a derelict colony ship.", choices: ["Board for salvage","Tow to nearest port","Mark as grave","Send a tribute"] as [string,string,string,string], weights: [12,10,14,8] as [number,number,number,number] },
  { prompt: "A pirate offers safe passage for tribute.", choices: ["Pay the toll","Fight through","Negotiate alliance","Reroute entirely"] as [string,string,string,string], weights: [10,14,12,8] as [number,number,number,number] },
  { prompt: "You meet a child of the stars, alone.", choices: ["Take them aboard","Leave food, depart","Find their family","Note the meeting"] as [string,string,string,string], weights: [16,8,14,10] as [number,number,number,number] },
  { prompt: "A vow grows heavy on your heart.", choices: ["Reaffirm it","Forsake it openly","Break it secretly","Modify the terms"] as [string,string,string,string], weights: [16,10,6,12] as [number,number,number,number] },
  { prompt: "Your final entry. What do you swear?", choices: ["I will return home","I will protect the weak","I will know my truth","I will carry hope"] as [string,string,string,string], weights: [14,16,12,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: StarforgedVowsSettings): StarforgedVowsState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: StarforgedVowsState, action: StarforgedVowsAction): StarforgedVowsState {
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
export function isTerminal(state: StarforgedVowsState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
