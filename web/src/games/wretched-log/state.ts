import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WretchedLogSettings { dummy: boolean; }
export interface WretchedLogState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WretchedLogAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Day 12. The hull groans. You have time for one task.", choices: ["Patch the inner seal", "Send a transmission home", "Sleep, finally", "Write the memorial list"], weights: [14, 12, 8, 10] },
  { prompt: "The ship's cat has not eaten in two days.", choices: ["Share your last protein bar", "Carry the cat to a warmer bay", "Note it in the log only", "Hold the cat, cry quietly"], weights: [16, 12, 6, 14] },
  { prompt: "A distant signal pings — distorted.", choices: ["Decode it", "Reply blindly", "Ignore it as ghost-noise", "Wake the others (there are no others)"], weights: [14, 10, 6, 12] },
  { prompt: "Your suit's helmet cracked.", choices: ["Repair it with tape", "Switch to spare", "Stay inside the ship", "Accept your radius is shrinking"], weights: [12, 14, 8, 8] },
  { prompt: "You hear a knock from outside.", choices: ["Look through the porthole", "Suit up and investigate", "Ignore it", "Mark the log as 'incident'"], weights: [10, 16, 6, 10] },
  { prompt: "The food locker is mostly empty.", choices: ["Ration to 200 calories per day", "Eat freely and live shorter", "Search the medbay for supplements", "Dump the spoiled, focus the rest"], weights: [12, 8, 14, 10] },
  { prompt: "Earth has not responded for sixteen days.", choices: ["Increase transmission power", "Stop transmitting altogether", "Send a personal message to family", "Send the system specs once more"], weights: [10, 6, 16, 8] },
  { prompt: "You find a photograph in an old crewmate's locker.", choices: ["Place it on your console", "Burn it to save fuel", "Tape it to the porthole", "Note their name in the log"], weights: [12, 4, 14, 12] },
  { prompt: "The reactor stutters.", choices: ["Realign the cells", "Bypass the safety", "Vent unused systems", "Power down the lights"], weights: [14, 10, 12, 8] },
  { prompt: "Your last transmission. What do you say?", choices: ["I am still here", "Please find this log", "Goodbye, Earth", "I forgive everyone"], weights: [16, 12, 10, 14] },
];
export function initialState(seed: number, _s: WretchedLogSettings): WretchedLogState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WretchedLogState, action: WretchedLogAction): WretchedLogState {
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
export function isTerminal(state: WretchedLogState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
