import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface AloneAmongStarsCardSettings { dummy: boolean; }
export interface AloneAmongStarsCardState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type AloneAmongStarsCardAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "World One: The sky is the wrong color.", choices: ["Magenta auroras","Black at noon","Slow-moving green","No sky at all"] as [string,string,string,string], weights: [14,12,14,10] as [number,number,number,number] },
  { prompt: "World Two: There is music here.", choices: ["From the rocks","From the wind","From the dead","From the ship"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "World Three: An obelisk, alone.", choices: ["Inscribed with names","Smooth and warm","Singing softly","Toppled and old"] as [string,string,string,string], weights: [14,12,16,10] as [number,number,number,number] },
  { prompt: "World Four: The locals are absent.", choices: ["But fires still burn","But meals still warm","But doors still close","But voices still echo"] as [string,string,string,string], weights: [14,14,12,16] as [number,number,number,number] },
  { prompt: "World Five: A garden grows in vacuum.", choices: ["Tended by no one","Tended by you","Tended by ghosts","Tended by light"] as [string,string,string,string], weights: [14,10,16,14] as [number,number,number,number] },
  { prompt: "World Six: A river flows uphill.", choices: ["Toward the sun","Toward a face","Toward the past","Toward your ship"] as [string,string,string,string], weights: [12,14,16,14] as [number,number,number,number] },
  { prompt: "World Seven: A child waves from a hill.", choices: ["Wave back","Approach slowly","Photograph silently","Leave food, depart"] as [string,string,string,string], weights: [16,14,10,14] as [number,number,number,number] },
  { prompt: "World Eight: A door stands without walls.", choices: ["Walk through","Walk around","Knock first","Refuse the door"] as [string,string,string,string], weights: [16,12,14,6] as [number,number,number,number] },
  { prompt: "World Nine: A library, abandoned.", choices: ["Read one book","Read every spine","Take a single page","Leave a note"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] },
  { prompt: "World Ten: A ship, identical to yours.", choices: ["Approach to dock","Hail urgently","Flee at once","Photograph and depart"] as [string,string,string,string], weights: [12,14,12,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: AloneAmongStarsCardSettings): AloneAmongStarsCardState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: AloneAmongStarsCardState, action: AloneAmongStarsCardAction): AloneAmongStarsCardState {
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
export function isTerminal(state: AloneAmongStarsCardState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
