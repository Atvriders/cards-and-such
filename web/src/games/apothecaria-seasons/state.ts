import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ApothecariaSeasonsSettings { dummy: boolean; }
export interface ApothecariaSeasonsState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ApothecariaSeasonsAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Spring. The wood-violet has bloomed.", choices: ["Harvest at noon","Harvest before dawn","Note the patch only","Replant what you take"] as [string,string,string,string], weights: [14,16,10,14] as [number,number,number,number] },
  { prompt: "A child has a fever that lingers.", choices: ["Brew willow tea","Apply mustard plaster","Sing them sleep","Send for the elder midwife"] as [string,string,string,string], weights: [16,12,14,10] as [number,number,number,number] },
  { prompt: "Summer. The garden grows wild fast.", choices: ["Weed all day","Let the bees decide","Harvest the strongest","Trim only the path"] as [string,string,string,string], weights: [12,14,16,12] as [number,number,number,number] },
  { prompt: "A traveler asks for a love charm.", choices: ["Make it small","Refuse the charm","Sell at high price","Make a friendship charm instead"] as [string,string,string,string], weights: [12,10,8,16] as [number,number,number,number] },
  { prompt: "Autumn. Berries hang heavy on the bramble.", choices: ["Pick for jam","Pick for tinctures","Leave for the birds","Trade for grain"] as [string,string,string,string], weights: [12,14,16,14] as [number,number,number,number] },
  { prompt: "An old hen has stopped laying.", choices: ["Stew for soup","Spare for company","Trade for chick","Let it walk free"] as [string,string,string,string], weights: [10,16,12,14] as [number,number,number,number] },
  { prompt: "Winter. The fire wood runs lower than feared.", choices: ["Ration each evening","Sleep in the kitchen","Borrow from neighbor","Sing to the cold"] as [string,string,string,string], weights: [16,14,10,12] as [number,number,number,number] },
  { prompt: "A villager confides a secret pregnancy.", choices: ["Brew gentle tea","Promise silence","Tell the midwife","Knit a small blanket"] as [string,string,string,string], weights: [14,16,8,14] as [number,number,number,number] },
  { prompt: "A wolf scratches at the cottage door.", choices: ["Open with food","Stay still inside","Sing softly through wood","Light an extra candle"] as [string,string,string,string], weights: [14,12,16,10] as [number,number,number,number] },
  { prompt: "Last entry of the year. What do you record?", choices: ["Patients healed","Herbs harvested","Mistakes made","Hopes for spring"] as [string,string,string,string], weights: [14,12,14,16] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ApothecariaSeasonsSettings): ApothecariaSeasonsState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ApothecariaSeasonsState, action: ApothecariaSeasonsAction): ApothecariaSeasonsState {
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
export function isTerminal(state: ApothecariaSeasonsState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
