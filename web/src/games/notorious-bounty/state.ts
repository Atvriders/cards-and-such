import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface NotoriousBountySettings { dummy: boolean; }
export interface NotoriousBountyState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type NotoriousBountyAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "The trail leads east. The horse is lame.", choices: ["Trade for a fresh mount", "Walk the rest of the day", "Camp and tend the leg", "Push the horse anyway"], weights: [14, 8, 12, 10] },
  { prompt: "A saloon owner remembers your fugitive.", choices: ["Buy him a drink for details", "Threaten him quietly", "Watch the room first", "Show him the wanted poster"], weights: [14, 10, 12, 8] },
  { prompt: "A child sells you the wrong directions.", choices: ["Pay him anyway", "Demand the right path", "Backtrack on instinct", "Follow him secretly"], weights: [10, 8, 14, 12] },
  { prompt: "Two riders block the canyon road.", choices: ["Try to talk past", "Draw first", "Ride hard around them", "Wait until nightfall"], weights: [12, 16, 10, 8] },
  { prompt: "The fugitive's sister begs for mercy.", choices: ["Promise to bring him alive", "Refuse and ride on", "Leave a note with her name", "Trade information for mercy"], weights: [14, 6, 12, 10] },
  { prompt: "A storm closes the high pass.", choices: ["Wait it out in a line shack", "Force the lower trail", "Turn back to the last town", "Ride through blind"], weights: [10, 14, 8, 12] },
  { prompt: "You catch a sleeping camp.", choices: ["Wait for dawn to call him out", "Take him in his sleep", "Watch and follow", "Fire a warning shot"], weights: [16, 10, 12, 8] },
  { prompt: "The bullet is in your shoulder. He's still ahead.", choices: ["Patch it and ride", "Ride to a town's doctor", "Bind it, sleep one night", "Push through the pain"], weights: [12, 10, 14, 8] },
  { prompt: "Your fugitive offers to surrender — for a price.", choices: ["Accept his terms", "Refuse and bring him bound", "Take half the price for half the body", "Walk away from this contract"], weights: [10, 14, 8, 6] },
  { prompt: "Final entry in the chase journal.", choices: ["He paid for his crimes", "I let him ride free", "Both of us went home", "Neither of us went home"], weights: [14, 10, 12, 8] },
];
export function initialState(seed: number, _s: NotoriousBountySettings): NotoriousBountyState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: NotoriousBountyState, action: NotoriousBountyAction): NotoriousBountyState {
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
export function isTerminal(state: NotoriousBountyState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
