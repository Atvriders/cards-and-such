import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface WanderhomeJourneySettings { dummy: boolean; }
export interface WanderhomeJourneyState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type WanderhomeJourneyAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A hedgehog innkeeper asks if you'd like soup.", choices: ["Yes, with extra herbs", "Tell a story for it", "Politely decline, eat alone", "Pay double, leave a coin for the cook"], weights: [14, 16, 6, 12] },
  { prompt: "The road forks beneath two old oaks.", choices: ["The path that smells of bread", "The path that hums softly", "The path lined with wildflowers", "Sit and ask the trees for advice"], weights: [12, 14, 16, 10] },
  { prompt: "A young goat is lost in the woods.", choices: ["Walk her home", "Wait with her till nightfall", "Show her the way and continue", "Carry her on your back"], weights: [16, 14, 10, 12] },
  { prompt: "An old fox-bard plays by the river.", choices: ["Listen for an hour", "Sing along", "Leave a coin and walk on", "Ask to learn the song"], weights: [12, 14, 8, 16] },
  { prompt: "Strangers wave from a barge.", choices: ["Wave back, pass on", "Ask for a ride", "Trade them stories of the road", "Walk along the riverbank with them"], weights: [10, 12, 14, 12] },
  { prompt: "The harvest festival begins in the next town.", choices: ["Stay for a week", "Pass through the dance briefly", "Bring an unusual fruit to share", "Help in the kitchens unseen"], weights: [14, 10, 16, 12] },
  { prompt: "An old badger gives you a feather of unknown bird.", choices: ["Wear it in your hat", "Press it in your journal", "Pass it on to next traveler", "Return it to the bird"], weights: [12, 14, 10, 16] },
  { prompt: "The first snow finds you on the moors.", choices: ["Make a snug camp", "Press on to the next inn", "Sit and watch the flakes", "Sing softly to keep warm"], weights: [14, 10, 12, 16] },
  { prompt: "A child rabbit asks where home is.", choices: ["Wherever I am with friends", "A place I will return to one day", "I have not found it yet", "It is the road itself"], weights: [14, 16, 10, 12] },
  { prompt: "End of journey. What do you bring back?", choices: ["A new song", "A new friend", "A pressed flower", "A warm memory"], weights: [14, 16, 12, 14] },
];
export function initialState(seed: number, _s: WanderhomeJourneySettings): WanderhomeJourneyState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: WanderhomeJourneyState, action: WanderhomeJourneyAction): WanderhomeJourneyState {
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
export function isTerminal(state: WanderhomeJourneyState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
