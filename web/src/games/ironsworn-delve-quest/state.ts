import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface IronswornDelveQuestSettings { dummy: boolean; }
export interface IronswornDelveQuestState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type IronswornDelveQuestAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Mouth of the delve. What do you hear?", choices: ["Wind through stone","Drip of slow water","A distant hammer","Nothing at all"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "First chamber, half-collapsed.", choices: ["Squeeze through","Climb over rubble","Dig a side route","Mark and retreat"] as [string,string,string,string], weights: [14,16,10,8] as [number,number,number,number] },
  { prompt: "A sigil glows on a worn pillar.", choices: ["Trace it carefully","Sketch and skip","Wash it away","Speak its sound"] as [string,string,string,string], weights: [14,16,6,12] as [number,number,number,number] },
  { prompt: "A trap snaps near your boot.", choices: ["Disarm carefully","Spring it on purpose","Mark and circle","Use a crow's weight"] as [string,string,string,string], weights: [14,8,16,10] as [number,number,number,number] },
  { prompt: "A door sealed with iron and prayer.", choices: ["Pry the seal","Pray your own","Find another path","Camp before opening"] as [string,string,string,string], weights: [10,12,16,14] as [number,number,number,number] },
  { prompt: "An old bone speaks your name.", choices: ["Answer it","Cover with cloth","Carry it with you","Bury it deeper"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "A river runs the wrong direction.", choices: ["Wade against it","Float along it","Bridge above it","Drink from it"] as [string,string,string,string], weights: [14,16,10,8] as [number,number,number,number] },
  { prompt: "A guardian rises from the floor.", choices: ["Strike first","Speak first","Yield first","Run first"] as [string,string,string,string], weights: [10,16,8,14] as [number,number,number,number] },
  { prompt: "A treasure shimmers in low light.", choices: ["Take it cleanly","Test it first","Leave it for now","Trade for safe passage"] as [string,string,string,string], weights: [10,16,12,14] as [number,number,number,number] },
  { prompt: "Final chamber. What was here all along?", choices: ["A name carved in iron","A door back home","A vow made true","A small bright song"] as [string,string,string,string], weights: [14,14,16,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: IronswornDelveQuestSettings): IronswornDelveQuestState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: IronswornDelveQuestState, action: IronswornDelveQuestAction): IronswornDelveQuestState {
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
export function isTerminal(state: IronswornDelveQuestState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
