import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ForTheCrownSagaSettings { dummy: boolean; }
export interface ForTheCrownSagaState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ForTheCrownSagaAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "The crown asks: do you fear them?", choices: ["I fear loss","I fear nothing","I fear myself","I fear the noise"] as [string,string,string,string], weights: [16,8,14,10] as [number,number,number,number] },
  { prompt: "An advisor whispers of poison in the goblet.", choices: ["Test it yourself","Switch the goblet","Warn the crown","Drink and pray"] as [string,string,string,string], weights: [14,12,16,4] as [number,number,number,number] },
  { prompt: "A masked envoy delivers an unmarked seal.", choices: ["Open at once","Burn unread","Trace the wax","Ask the crown first"] as [string,string,string,string], weights: [14,6,16,10] as [number,number,number,number] },
  { prompt: "Servants gossip of a foreign suitor.", choices: ["Eavesdrop fully","Silence them","Repeat to the crown","Believe the gossip"] as [string,string,string,string], weights: [14,8,12,10] as [number,number,number,number] },
  { prompt: "A captain proposes a coup that night.", choices: ["Refuse aloud","Listen, then betray","Join cautiously","Walk away in silence"] as [string,string,string,string], weights: [12,14,8,14] as [number,number,number,number] },
  { prompt: "A library scribe reveals a hidden lineage.", choices: ["Record it","Conceal it","Confront the scribe","Tell the crown gently"] as [string,string,string,string], weights: [16,10,8,14] as [number,number,number,number] },
  { prompt: "The crown confides a single fear.", choices: ["Listen in silence","Offer counsel","Hold their hand","Promise protection"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] },
  { prompt: "A gardener slips you a single white rose.", choices: ["Wear it openly","Press it in a book","Burn it carefully","Return it at dawn"] as [string,string,string,string], weights: [12,14,8,12] as [number,number,number,number] },
  { prompt: "A traitor is unmasked at supper.", choices: ["Demand justice","Show mercy","Suggest exile","Watch silently"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "Your last vow to the crown.", choices: ["I serve until death","I serve until truth","I serve only love","I serve the kingdom"] as [string,string,string,string], weights: [14,16,14,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ForTheCrownSagaSettings): ForTheCrownSagaState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ForTheCrownSagaState, action: ForTheCrownSagaAction): ForTheCrownSagaState {
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
export function isTerminal(state: ForTheCrownSagaState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
