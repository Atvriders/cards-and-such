import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ApothecariaWitchSettings { dummy: boolean; }
export interface ApothecariaWitchState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ApothecariaWitchAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Spring. The first dandelions appear.", choices: ["Gather the leaves for tonic", "Let them flower for bees", "Press a few for tea", "Make a wreath for the door"], weights: [14, 12, 10, 8] },
  { prompt: "A villager limps to your door with a chill.", choices: ["Brew thyme and willow", "Send him home with bread", "Examine carefully first", "Offer the bed by the fire"], weights: [16, 6, 14, 10] },
  { prompt: "A fox eats from your scrap pile each night.", choices: ["Leave better scraps", "Set a humane trap", "Watch from the window", "Whisper to it through the door"], weights: [14, 6, 10, 12] },
  { prompt: "Summer. The garden is overflowing.", choices: ["Dry herbs for winter", "Trade at the market", "Gift bundles to villagers", "Make a great soup"], weights: [16, 14, 12, 10] },
  { prompt: "A traveling apprentice asks to learn.", choices: ["Take her on for a season", "Test her first", "Send her to a senior witch", "Refuse politely"], weights: [16, 12, 8, 6] },
  { prompt: "Autumn. A fever sweeps the village.", choices: ["Make many small bottles", "Visit the worst-off first", "Brew a strong cure", "Coordinate with the priest"], weights: [16, 14, 12, 10] },
  { prompt: "The old miller refuses your help.", choices: ["Leave the brew on his step", "Speak to his daughter", "Respect his wishes entirely", "Try once more, gently"], weights: [12, 14, 8, 10] },
  { prompt: "Winter. You have one candle for tonight.", choices: ["Read the old grimoire", "Sleep early to save oil", "Write notes in the margin", "Sit with the cat by the fire"], weights: [14, 10, 12, 12] },
  { prompt: "A child is born with the snow.", choices: ["Brew a strengthening tea", "Bring a small gift", "Bless the doorway", "Note the date in your almanac"], weights: [12, 14, 10, 16] },
  { prompt: "The year ends. What endures?", choices: ["A full apothecary", "A village that remembers you", "A garden ready for spring", "A book with new pages"], weights: [14, 16, 12, 14] },
];
export function initialState(seed: number, _s: ApothecariaWitchSettings): ApothecariaWitchState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ApothecariaWitchState, action: ApothecariaWitchAction): ApothecariaWitchState {
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
export function isTerminal(state: ApothecariaWitchState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
