import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface TslSoloQuestSettings { dummy: boolean; }
export interface TslSoloQuestState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type TslSoloQuestAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A rival blocks the path with a smirk.", choices: ["Flirt past","Duel openly","Bow and walk wide","Compliment the smirk"] as [string,string,string,string], weights: [16,12,8,14] as [number,number,number,number] },
  { prompt: "A dragon offers tea.", choices: ["Accept gracefully","Decline with grace","Bring a gift first","Sit, but don't drink"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "An old flame is the captive you must free.", choices: ["Free without speaking","Speak the unsaid first","Pretend not to know them","Free and walk on"] as [string,string,string,string], weights: [12,16,8,14] as [number,number,number,number] },
  { prompt: "A villain wants a duel of poetry.", choices: ["Compose a verse","Refuse the form","Counter with a dance","Concede and leave"] as [string,string,string,string], weights: [16,8,14,10] as [number,number,number,number] },
  { prompt: "A potion glints with a familiar shimmer.", choices: ["Taste cautiously","Hand to companion","Pour out gently","Save for the boss fight"] as [string,string,string,string], weights: [10,14,8,16] as [number,number,number,number] },
  { prompt: "An ally confesses on the battlements.", choices: ["Confess back","Promise to think","Hold them silently","Set the moment aside"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "A sworn rival asks to dance.", choices: ["Dance once","Decline politely","Dance and lead","Insist they lead"] as [string,string,string,string], weights: [14,10,16,14] as [number,number,number,number] },
  { prompt: "A village priest demands a vow.", choices: ["Vow truthfully","Vow softly","Refuse the priest","Make a private vow"] as [string,string,string,string], weights: [12,16,8,14] as [number,number,number,number] },
  { prompt: "The villain is unmasked: a former mentor.", choices: ["Strike at once","Hold blade still","Speak first","Embrace then strike"] as [string,string,string,string], weights: [10,14,16,12] as [number,number,number,number] },
  { prompt: "Final entry. What do you sheathe?", choices: ["Sword and pride","Sword and grief","Sword and love","Sword alone"] as [string,string,string,string], weights: [12,14,16,12] as [number,number,number,number] }
];
export function initialState(seed: number, _s: TslSoloQuestSettings): TslSoloQuestState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: TslSoloQuestState, action: TslSoloQuestAction): TslSoloQuestState {
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
export function isTerminal(state: TslSoloQuestState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
