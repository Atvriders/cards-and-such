import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface SunderedIslesSagaSettings { dummy: boolean; }
export interface SunderedIslesSagaState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type SunderedIslesSagaAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A storm cell tightens off the lee bow.", choices: ["Run before the wind","Heave-to and ride","Reef and beat through","Strike colors and beg"] as [string,string,string,string], weights: [14,12,16,4] as [number,number,number,number] },
  { prompt: "A rival flagship hails you politely.", choices: ["Parlay over rum","Engage at dawn","Reroute under cover","Send false flag back"] as [string,string,string,string], weights: [14,12,10,8] as [number,number,number,number] },
  { prompt: "Your bosun reports rot in the keel.", choices: ["Beach for repair","Bilge harder, sail on","Buy lumber from rivals","Start carving a replacement"] as [string,string,string,string], weights: [16,8,12,10] as [number,number,number,number] },
  { prompt: "An island appears that no chart names.", choices: ["Land cautiously","Chart from sea","Sail past respectfully","Send a longboat alone"] as [string,string,string,string], weights: [14,12,10,12] as [number,number,number,number] },
  { prompt: "A merchant captive offers ransom in trade.", choices: ["Accept gold ransom","Free them outright","Demand cargo charter","Hold for greater offer"] as [string,string,string,string], weights: [12,14,14,8] as [number,number,number,number] },
  { prompt: "Your crew demands a song before sleep.", choices: ["Sing of victories","Sing of the lost","Tell a true tale","Pour rum and sleep"] as [string,string,string,string], weights: [12,16,14,10] as [number,number,number,number] },
  { prompt: "A whirlpool yawns where calm seas were.", choices: ["Skirt the rim","Throw cargo to placate","Plunge through center","Anchor far away"] as [string,string,string,string], weights: [16,10,4,12] as [number,number,number,number] },
  { prompt: "An old captain's logbook drifts aboard.", choices: ["Read every page","Burn unread","Copy and return","Trade for chart"] as [string,string,string,string], weights: [14,4,16,10] as [number,number,number,number] },
  { prompt: "A small isle holds a buried voice.", choices: ["Dig it free","Listen and leave","Bury it deeper","Build a marker"] as [string,string,string,string], weights: [12,14,10,12] as [number,number,number,number] },
  { prompt: "Your last vow. What do you swear to seas?", choices: ["I will return","I will free flags","I will keep the songs","I will sail past pain"] as [string,string,string,string], weights: [14,14,16,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: SunderedIslesSagaSettings): SunderedIslesSagaState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: SunderedIslesSagaState, action: SunderedIslesSagaAction): SunderedIslesSagaState {
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
export function isTerminal(state: SunderedIslesSagaState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
