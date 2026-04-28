import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface StarforgedSagaSettings { dummy: boolean; }
export interface StarforgedSagaState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type StarforgedSagaAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A signal echoes from a derelict cruiser drifting in deep space.", choices: ["Board it suited and armed", "Scan and move on", "Mark it for later salvage", "Broadcast a warning to others"], weights: [14, 8, 10, 6] },
  { prompt: "Your ship's drive sputters in interspace.", choices: ["Risk a hard reboot", "Drop into a nearby system", "Eject the unstable cell", "Push through and hope"], weights: [12, 10, 14, 6] },
  { prompt: "A settlement begs for protection from raiders.", choices: ["Accept the contract", "Negotiate a higher price", "Refuse, the vow elsewhere is heavier", "Warn nearby authorities first"], weights: [16, 10, 6, 12] },
  { prompt: "You meet a faction's emissary on neutral station.", choices: ["Sign their accord", "Decline politely", "Ask for time to consider", "Make a counter-offer"], weights: [10, 8, 12, 14] },
  { prompt: "An unknown precursor relic glows aboard your ship.", choices: ["Document it carefully", "Sell it to the highest bidder", "Hide it in your own quarters", "Hand it to the academy"], weights: [12, 14, 8, 10] },
  { prompt: "A pirate frigate hails for parley.", choices: ["Listen to their offer", "Open fire", "Run to the asteroid field", "Demand they go first"], weights: [10, 16, 8, 12] },
  { prompt: "Your sworn ally is captured.", choices: ["Mount a rescue alone", "Hire mercenaries", "Bargain with the captors", "Wait and gather intel"], weights: [16, 10, 12, 8] },
  { prompt: "You discover a habitable but inhabited world.", choices: ["Make peaceful contact", "Observe in secret", "Mark coordinates, leave", "Report it to a faction"], weights: [12, 10, 8, 14] },
  { prompt: "Your supplies run low between systems.", choices: ["Ration aggressively", "Drop into cold-sleep", "Burn a vow's fuel reserve", "Trade with the next ship"], weights: [10, 14, 12, 8] },
  { prompt: "The vow is fulfilled. Where will you forge next?", choices: ["The deep dark beyond the rim", "Back to the home settlement", "A new sworn iron", "Drift, until the next signal"], weights: [16, 10, 14, 12] },
];
export function initialState(seed: number, _s: StarforgedSagaSettings): StarforgedSagaState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: StarforgedSagaState, action: StarforgedSagaAction): StarforgedSagaState {
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
export function isTerminal(state: StarforgedSagaState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
