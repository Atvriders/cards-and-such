import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ExNovoMapmakerSettings { dummy: boolean; }
export interface ExNovoMapmakerState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ExNovoMapmakerAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Era I. A founder plants a stake.", choices: ["At a river bend","At a crossroads","At a defensible hill","At a mineral spring"] as [string,string,string,string], weights: [16,14,14,12] as [number,number,number,number] },
  { prompt: "Era II. The first wall is laid.", choices: ["Of timber","Of stone","Of earthwork","No wall — open town"] as [string,string,string,string], weights: [12,16,14,10] as [number,number,number,number] },
  { prompt: "Era III. A market quarter rises.", choices: ["Around a temple","By the river docks","Near the gates","At the founder's home"] as [string,string,string,string], weights: [14,16,14,10] as [number,number,number,number] },
  { prompt: "Era IV. A first crisis.", choices: ["A flood","A fire","A plague","A siege"] as [string,string,string,string], weights: [12,14,16,14] as [number,number,number,number] },
  { prompt: "Era V. The town rebuilds.", choices: ["Larger and brighter","Smaller and softer","Strangely, twisted","Identical, defiant"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] },
  { prompt: "Era VI. A faith arrives by sea.", choices: ["Welcomed publicly","Refused publicly","Practiced secretly","Coexists quietly"] as [string,string,string,string], weights: [14,10,14,16] as [number,number,number,number] },
  { prompt: "Era VII. A hero is born here.", choices: ["Statue raised","Forgotten in time","Banished, then loved","Loved, then banished"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] },
  { prompt: "Era VIII. A river shifts course.", choices: ["Town moves with it","Town builds dam","Town shrinks slowly","Town adapts trade"] as [string,string,string,string], weights: [12,14,14,16] as [number,number,number,number] },
  { prompt: "Era IX. A railway is proposed.", choices: ["Embraced fully","Refused entirely","Accepted with conditions","Built secretly"] as [string,string,string,string], weights: [14,8,16,10] as [number,number,number,number] },
  { prompt: "Era X. The chronicle's last line.", choices: ["The town endures","The town empties","The town renames","The town remembers"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ExNovoMapmakerSettings): ExNovoMapmakerState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ExNovoMapmakerState, action: ExNovoMapmakerAction): ExNovoMapmakerState {
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
export function isTerminal(state: ExNovoMapmakerState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
