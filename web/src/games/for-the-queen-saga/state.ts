import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ForTheQueenSagaSettings { dummy: boolean; }
export interface ForTheQueenSagaState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ForTheQueenSagaAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "The Queen asks why you joined her court.", choices: ["For honor and oath", "For the gold she promised", "Because she saved my sister", "Because there was nowhere else"], weights: [12, 8, 14, 10] },
  { prompt: "On the third night, you see her weep.", choices: ["Sit with her in silence", "Pretend you saw nothing", "Offer wine and a story", "Wake another retainer to help"], weights: [14, 8, 12, 10] },
  { prompt: "An advisor whispers of poison in her cup.", choices: ["Drink first to test", "Confront the advisor", "Warn her in private", "Switch the cups secretly"], weights: [16, 12, 14, 10] },
  { prompt: "She asks you to lie for her.", choices: ["Lie willingly", "Lie reluctantly", "Refuse, but stay loyal", "Refuse and leave her service"], weights: [10, 12, 14, 6] },
  { prompt: "You know the road ahead is unsafe.", choices: ["Tell her to turn back", "Take a hidden path", "Press on as ordered", "Send a decoy ahead"], weights: [12, 14, 10, 12] },
  { prompt: "Her former lover asks for a moment.", choices: ["Refuse them", "Allow the meeting", "Listen at the door", "Tell her about it later"], weights: [10, 12, 8, 14] },
  { prompt: "A child of the village offers her a flower.", choices: ["Smile and say nothing", "Compose a poem about it", "Warn her of village politics", "Give the child a coin yourself"], weights: [10, 14, 12, 12] },
  { prompt: "You overhear plans for treason.", choices: ["Tell her at once", "Investigate alone first", "Confront the plotters quietly", "Remain silent and watchful"], weights: [16, 14, 10, 8] },
  { prompt: "She asks if you would die for her.", choices: ["Yes, without question", "If the cause was just", "I would rather live for her", "I do not yet know"], weights: [16, 12, 10, 8] },
  { prompt: "The final card is drawn. Will you betray her?", choices: ["Never. Ride beside her", "Yes, the time has come", "Walk away in the night", "Stand and confess your doubts"], weights: [16, 10, 6, 12] },
];
export function initialState(seed: number, _s: ForTheQueenSagaSettings): ForTheQueenSagaState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ForTheQueenSagaState, action: ForTheQueenSagaAction): ForTheQueenSagaState {
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
export function isTerminal(state: ForTheQueenSagaState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
