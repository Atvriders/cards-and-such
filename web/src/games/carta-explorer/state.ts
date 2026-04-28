import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface CartaExplorerSettings { dummy: boolean; }
export interface CartaExplorerState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type CartaExplorerAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "First card flipped: an empty room.", choices: ["Search the corners carefully", "Sketch the walls in your log", "Move on to find more", "Sit and listen for a moment"], weights: [14, 12, 10, 16] },
  { prompt: "A card shows a locked door.", choices: ["Try every key you carry", "Pick the lock", "Mark for later, walk on", "Knock politely"], weights: [12, 14, 8, 16] },
  { prompt: "Two adjacent cards reveal water.", choices: ["Wade carefully", "Map the shoreline first", "Cast a stone to test depth", "Camp here for the night"], weights: [12, 14, 10, 16] },
  { prompt: "Card flipped reveals a stranger.", choices: ["Speak first", "Hide and watch", "Offer trade", "Walk past silently"], weights: [12, 10, 16, 8] },
  { prompt: "A card shows treasure — small but heavy.", choices: ["Take only one piece", "Take all you can carry", "Note location, leave it", "Trade it later for safe passage"], weights: [14, 8, 12, 16] },
  { prompt: "A card shows a stairway down.", choices: ["Descend immediately", "Map this floor first", "Send a sound test down", "Camp at the top"], weights: [12, 16, 10, 14] },
  { prompt: "A card is blank.", choices: ["Treat it as a moment of rest", "Search again to be sure", "Mark it as dangerous", "Note it as 'fog'"], weights: [16, 12, 8, 14] },
  { prompt: "A card shows another explorer's body.", choices: ["Leave them in peace", "Search their pack", "Take only their journal", "Bury them with effort"], weights: [12, 8, 16, 14] },
  { prompt: "A card shows the exit, but the map is incomplete.", choices: ["Leave now with what you have", "Press on to fill the map", "Memorize the route, return for more", "Sit at the threshold"], weights: [12, 14, 16, 10] },
  { prompt: "Final entry: what was this place?", choices: ["A library that lost its keepers", "A garden someone abandoned", "A house that remembered its people", "A road built by someone else"], weights: [14, 12, 16, 14] },
];
export function initialState(seed: number, _s: CartaExplorerSettings): CartaExplorerState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: CartaExplorerState, action: CartaExplorerAction): CartaExplorerState {
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
export function isTerminal(state: CartaExplorerState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
