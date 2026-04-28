import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ThousandYearVampireSettings { dummy: boolean; }
export interface ThousandYearVampireState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ThousandYearVampireAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "1217. You wake in stone. The face above you is your maker.", choices: ["Embrace them in gratitude", "Strike them and flee", "Ask only for their name", "Remain silent and watch"], weights: [12, 10, 14, 8] },
  { prompt: "1342. A plague sweeps your city.", choices: ["Hunt the dying for ease", "Hide in the catacombs", "Save a single mortal child", "Walk among them unafraid"], weights: [10, 8, 16, 12] },
  { prompt: "1492. Your first lover dies of old age.", choices: ["Attend the funeral unseen", "Forget them deliberately", "Write their name in stone", "Visit them years later as ghost"], weights: [14, 6, 16, 10] },
  { prompt: "1605. A hunter knows your name.", choices: ["Vanish into a new identity", "Confront them in their bed", "Lead them to ruin slowly", "Spare them and disappear"], weights: [12, 14, 10, 8] },
  { prompt: "1789. The world burns with revolution.", choices: ["Take a side", "Feed in the chaos", "Flee the continent", "Watch from a balcony"], weights: [10, 14, 8, 12] },
  { prompt: "1850. You forget your maker's face.", choices: ["Search old letters", "Let the memory die", "Carve it from imagination", "Kill someone who reminds you"], weights: [12, 10, 14, 4] },
  { prompt: "1918. War's wounded are everywhere.", choices: ["Tend mortals as a nurse", "Feed selectively in trenches", "Hide for the entire war", "Walk the battlefields by night"], weights: [14, 12, 8, 10] },
  { prompt: "1969. Television shows astronauts on the moon.", choices: ["Mourn the lost wonder", "Celebrate humanity's reach", "Feel only hunger", "Write a letter to no one"], weights: [10, 14, 8, 12] },
  { prompt: "2007. You see your own face in a stranger.", choices: ["Approach and ask their name", "Follow them silently", "Walk away forever", "Write a long entry tonight"], weights: [12, 10, 8, 14] },
  { prompt: "Today. The journal pages are nearly full.", choices: ["Write of recent hunger", "Burn the oldest pages", "Begin a new volume", "Close the book with a name"], weights: [12, 8, 14, 16] },
];
export function initialState(seed: number, _s: ThousandYearVampireSettings): ThousandYearVampireState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ThousandYearVampireState, action: ThousandYearVampireAction): ThousandYearVampireState {
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
export function isTerminal(state: ThousandYearVampireState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
