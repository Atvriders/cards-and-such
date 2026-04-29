import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface DungeonHeroCardsSettings { dummy: boolean; }
export interface DungeonHeroCardsState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type DungeonHeroCardsAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Flip 1: Mossy archway, warm air beyond.", choices: ["Step through quickly","Test for traps first","Mark and continue circuit","Rest before entering"] as [string,string,string,string], weights: [12,16,10,14] as [number,number,number,number] },
  { prompt: "Flip 2: A lone goblin polishing armor.", choices: ["Strike from cover","Hail in goblin tongue","Trade rations for safe passage","Sneak around"] as [string,string,string,string], weights: [10,16,14,12] as [number,number,number,number] },
  { prompt: "Flip 3: An idol drips honey-colored sap.", choices: ["Collect the sap","Topple the idol","Bow and pass","Smear sigil with sap"] as [string,string,string,string], weights: [12,8,16,14] as [number,number,number,number] },
  { prompt: "Flip 4: A pit, with a rope half-rotten.", choices: ["Climb the rope","Find a new rope","Build a bridge","Walk around"] as [string,string,string,string], weights: [10,14,12,16] as [number,number,number,number] },
  { prompt: "Flip 5: A library left half-burned.", choices: ["Read every page","Take one book","Burn what survived","Repair the binding"] as [string,string,string,string], weights: [12,14,8,16] as [number,number,number,number] },
  { prompt: "Flip 6: A guardian made of clay and air.", choices: ["Strike the seal","Bow respectfully","Speak its makers' name","Pour water on it"] as [string,string,string,string], weights: [10,14,16,8] as [number,number,number,number] },
  { prompt: "Flip 7: A small forge still warm.", choices: ["Make a tool","Reforge your blade","Take coals only","Leave the forge alone"] as [string,string,string,string], weights: [14,16,10,12] as [number,number,number,number] },
  { prompt: "Flip 8: A river splits the dungeon.", choices: ["Wade across","Build a raft","Follow the river","Climb above it"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "Flip 9: A throne, with a single skull.", choices: ["Sit briefly","Bow and depart","Take the skull","Set a candle on it"] as [string,string,string,string], weights: [10,14,12,16] as [number,number,number,number] },
  { prompt: "Flip 10: The exit. What did you carry?", choices: ["A book","A blade","A name","A lesson"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: DungeonHeroCardsSettings): DungeonHeroCardsState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: DungeonHeroCardsState, action: DungeonHeroCardsAction): DungeonHeroCardsState {
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
export function isTerminal(state: DungeonHeroCardsState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
