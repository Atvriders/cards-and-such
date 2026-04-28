import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface SigilWizardSettings { dummy: boolean; }
export interface SigilWizardState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type SigilWizardAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "Your first apprenticeship was with?", choices: ["A swamp witch with strict rules", "A traveling stage-magician", "A library spirit, by accident", "A river otter, somehow"], weights: [14, 12, 16, 10] },
  { prompt: "First spell you mastered?", choices: ["Light a candle from across the room", "Convince animals to not leave", "Translate one sentence per day", "Make tea boil twice as fast"], weights: [14, 12, 10, 16] },
  { prompt: "Your familiar is?", choices: ["A grumpy raven", "A polite goat", "A jellyfish in a jar", "A small fire in a teapot"], weights: [12, 14, 16, 14] },
  { prompt: "Most prized magical item?", choices: ["A bone needle", "A folded map of nowhere", "A glass eye that blinks", "A book of receipts written in tongues"], weights: [12, 14, 12, 16] },
  { prompt: "First enemy you swore against?", choices: ["A noble who burned a library", "A god who never replies", "A childhood rival now grown", "The version of yourself that stayed home"], weights: [14, 16, 12, 14] },
  { prompt: "A friend whose name you keep at the front of your spellbook?", choices: ["A baker who fed you", "A guard who let you flee", "A dog who trusted you", "A scholar who corrected you"], weights: [14, 12, 16, 14] },
  { prompt: "Greatest mistake?", choices: ["Refused a teacher's last lesson", "Burned a manuscript in haste", "Trusted the wrong patron", "Forgot a name on purpose"], weights: [14, 12, 14, 10] },
  { prompt: "Where do you live now?", choices: ["A tower over the marsh", "A wagon that moves with you", "A guest room of an inn", "An apartment above a bakery"], weights: [12, 14, 10, 16] },
  { prompt: "What does your magic look like?", choices: ["Slow, careful, ink-like", "Bright, brief, like sparks", "Quiet, almost inaudible", "Loud, with smell of bread"], weights: [14, 12, 16, 12] },
  { prompt: "Final entry: what does your gravestone say?", choices: ["She listened well", "He kept his promises", "They made one good thing", "Even the cat misses them"], weights: [14, 16, 14, 16] },
];
export function initialState(seed: number, _s: SigilWizardSettings): SigilWizardState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: SigilWizardState, action: SigilWizardAction): SigilWizardState {
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
export function isTerminal(state: SigilWizardState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
