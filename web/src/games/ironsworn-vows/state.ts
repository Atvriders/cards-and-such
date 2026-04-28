import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface IronswornVowsSettings { dummy: boolean; }
export interface IronswornVowsState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type IronswornVowsAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A blackwood crow lands on your shield arm. What do you swear?", choices: ["Vengeance against an old foe", "Protection of a fading settlement", "Discovery of a lost ruin", "Forsaking of all old debts"], weights: [12, 10, 14, 8] },
  { prompt: "You enter the Veiled Mountains. The path forks.", choices: ["Take the high cold ridge", "Descend into the misty valley", "Camp until dawn", "Turn back, vow undone"], weights: [14, 12, 8, 6] },
  { prompt: "A stranger offers shelter. They wear a sigil you do not know.", choices: ["Accept warmth and food", "Watch from the edge of camp", "Refuse and walk on", "Confront them about the sigil"], weights: [10, 12, 8, 14] },
  { prompt: "Wolves circle your camp at midnight.", choices: ["Stand and fight", "Climb into the tree", "Throw your last meat", "Light the fire higher"], weights: [16, 10, 8, 12] },
  { prompt: "An old man carves runes by the river.", choices: ["Ask his name", "Trade a story for a rune", "Watch silently", "Steal one rune-stick"], weights: [10, 14, 8, 4] },
  { prompt: "Your iron vow weighs heavy. The settlement is closer than the foe.", choices: ["Press toward the foe", "Detour to the settlement", "Rest in the wild for clarity", "Renounce the vow openly"], weights: [14, 12, 10, 4] },
  { prompt: "A fisher invites you onto her boat for the crossing.", choices: ["Pay her in coin", "Trade a song", "Row in her place", "Walk the long way around"], weights: [10, 12, 16, 6] },
  { prompt: "You find a half-buried sword in the bog.", choices: ["Take it as a sign", "Leave it for the bog spirits", "Bury it deeper", "Carry it to a smith"], weights: [12, 10, 8, 14] },
  { prompt: "A wounded raider asks for water.", choices: ["Tend his wounds", "Question him first", "Give water and walk on", "Refuse and ride past"], weights: [14, 12, 10, 6] },
  { prompt: "The vow is fulfilled. What do you write last in your log?", choices: ["I remember every name", "The land healed in time", "I rest only one night", "Another vow already calls"], weights: [12, 14, 10, 16] },
];
export function initialState(seed: number, _s: IronswornVowsSettings): IronswornVowsState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: IronswornVowsState, action: IronswornVowsAction): IronswornVowsState {
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
export function isTerminal(state: IronswornVowsState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
