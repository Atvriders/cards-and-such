import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface AloneAmongStarsTaleSettings { dummy: boolean; }
export interface AloneAmongStarsTaleState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type AloneAmongStarsTaleAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Your scout-craft lands. The sky is what color?", choices: ["A green that hums", "A pink that sings", "A black with two suns", "A grey like home"], weights: [14, 12, 16, 6] },
  { prompt: "Something moves in the grass nearby.", choices: ["Approach calmly", "Watch from the cockpit", "Take a sample with a wand", "Whisper a greeting"], weights: [12, 8, 14, 10] },
  { prompt: "A spire of crystal sings in the wind.", choices: ["Record the sound", "Touch the crystal gently", "Sketch it in your log", "Walk past respectfully"], weights: [14, 10, 12, 8] },
  { prompt: "You find footprints. Three-toed.", choices: ["Follow them", "Photograph and turn back", "Make a cast in resin", "Mark the location, walk on"], weights: [12, 10, 14, 8] },
  { prompt: "Rain falls — but it is warm and red.", choices: ["Catch a drop on your tongue", "Run to shelter", "Collect a sample carefully", "Write a poem under the eaves"], weights: [14, 6, 16, 12] },
  { prompt: "Twin moons rise. One is shaped like a square.", choices: ["Stay up to watch them", "Sleep, you are tired", "Record their movement", "Speak their names aloud"], weights: [12, 8, 14, 10] },
  { prompt: "A small creature follows you back to camp.", choices: ["Feed it a ration bar", "Keep it at distance", "Photograph it sleeping", "Thank it and walk away"], weights: [16, 8, 14, 10] },
  { prompt: "Your translator picks up a song with no source.", choices: ["Try to translate", "Record raw audio", "Hum along", "Ignore it, focus on map"], weights: [14, 10, 12, 6] },
  { prompt: "The world's name. What will you call it?", choices: ["After someone you loved", "After what it sounds like", "After a number", "Refuse to name it"], weights: [16, 14, 6, 8] },
  { prompt: "Time to leave. Your final entry?", choices: ["I want to come back", "I will not return", "It taught me a word", "It taught me silence"], weights: [14, 8, 16, 14] },
];
export function initialState(seed: number, _s: AloneAmongStarsTaleSettings): AloneAmongStarsTaleState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: AloneAmongStarsTaleState, action: AloneAmongStarsTaleAction): AloneAmongStarsTaleState {
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
export function isTerminal(state: AloneAmongStarsTaleState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
